import cors from 'cors';
import express, { NextFunction, Request, Response, Router } from 'express';
import fs from 'fs';
import fsPromise from 'fs/promises';
import * as os from 'node:os';
import { Octokit } from 'octokit';
import path from 'path';
import { Config, OcotokitRepoList, ProjectConfig } from './models';
import { WorkflowRun } from './models/WorkflowRun';
import download from './utils/download';
import { executeShellCommand } from './utils/jsshell';
import Logger from './utils/logger';
import { startPm2App, stopPm2App, syncPm2StartupScripts } from './utils/pm2';
import { folderSetup } from './utils/setup';
import { unzip } from './utils/zip';

const app = express();
const router = Router();

app.use(cors());
app.use(express.json());

const configPath = path.join(
  os.homedir(),
  'meeploy',
  'server',
  'run',
  'config',
  'config.json'
);
const configContent = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configContent) as Config;

const DOWNLOAD_PATH = path.join(os.homedir(), config.downloadPath);
const RUN_PATH = path.join(os.homedir(), config.runPath);
const ECOSYSTEM_PATH = path.join(os.homedir(), config.ecosystemFilePath);

async function init() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PRIVATE_TOKEN,
  });

  try {
    await folderSetup();
  } catch (error) {
    Logger.error(error);
    return;
  }

  router.post(
    '/webhook',
    async (
      req: Request<{}, {}, WorkflowRun>,
      res: Response,
      next: NextFunction
    ) => {
      const { repository, action } = req.body;

      // * Webhook received - immediately send OK response
      res.sendStatus(200);

      Logger.info(`Got request with action ${action}`);

      // * Only trigger when workflow is in state 'completed'
      if (action === undefined || action === 'requested') {
        return;
      }

      // * Find project setting in config file
      let projectsConfig: ProjectConfig;
      try {
        const projectsFile = await fsPromise.readFile(ECOSYSTEM_PATH, {
          encoding: 'utf-8',
        });
        projectsConfig = JSON.parse(projectsFile) as ProjectConfig;

        if (projectsConfig.apps.length === 0) {
          throw new Error();
        }
      } catch (error) {
        Logger.error(`Projects file not found or corrupt (${ECOSYSTEM_PATH})`);
        return;
      }

      const project = projectsConfig.apps.find(
        (x) => x.name === repository.name
      );

      if (project === undefined) {
        Logger.error('Project not in projects file');
        return;
      }

      // * 1. Download the build artifact

      const fileName = `${repository.name}.zip`;
      const downloadFullPath = path.join(DOWNLOAD_PATH, fileName);
      const runFullPath = path.join(RUN_PATH, fileName);

      // * Get latest artifact from GitHub
      const listArtifactsResult = await octokit.request<OcotokitRepoList>({
        url: `/repos/${repository.owner.login}/${repository.name}/actions/artifacts`,
        method: 'GET',
      });

      if (listArtifactsResult.data.total_count === 0) {
        Logger.error(`No artifacts for repo ${repository.name}`);
      }

      const latestArtifact = listArtifactsResult.data.artifacts.sort(
        (a, b) => b.id - a.id
      )[0];

      // * Get download URL from octo
      const octoResponse = await octokit.request({
        method: 'GET',
        url: `/repos/${repository.owner.login}/${repository.name}/actions/artifacts/${latestArtifact.id}/zip`,
      });

      if (octoResponse.status !== 200) {
        Logger.error('Error from Octo', octoResponse.status);
        return;
      }

      try {
        await download(octoResponse.url, downloadFullPath);
      } catch (error) {
        Logger.error(`Error downloading artifacts`, error);
      }

      // * 3. Copy from download folder to run folder
      await fsPromise.cp(downloadFullPath, runFullPath);

      // * 2. Unzip the build artifact
      const rootFolderPath = path.join(RUN_PATH, repository.name);
      try {
        await fsPromise.stat(rootFolderPath);
        await fsPromise.rm(rootFolderPath, { force: true, recursive: true });
      } catch (error) {
        Logger.info(`Root folder not found -> creating , ${rootFolderPath}`);
      }
      await fsPromise.mkdir(rootFolderPath);
      await unzip(runFullPath, rootFolderPath);

      // * 4. Install dependencies

      if (project.interpreter !== undefined) {
        // * Defaults to node
        if (project.interpreter.includes('python')) {
          console.log('Found python project');
          // ? Set this to install .venv in project folder
          await executeShellCommand(rootFolderPath, 'pipenv', ['install'], {
            PIPENV_VENV_IN_PROJECT: '1',
          });
        } else if (project.interpreter.includes('python')) {
          console.log('Found node project');
          await executeShellCommand(rootFolderPath, 'yarn', ['install']);
        }
      } else {
        console.log('Found node project');
        await executeShellCommand(rootFolderPath, 'yarn', ['install']);
      }

      // * 5. Stop project
      try {
        await stopPm2App(repository.name);
      } catch (error) {
        Logger.error(`Error stopping project`, error);
      }

      // * 6. Run project
      try {
        await startPm2App(repository.name);
      } catch (error) {
        Logger.error(`Error starting project`, error);
      }

      await syncPm2StartupScripts();
    }
  );

  app.use('/', router);

  app.listen(config.port, () => {
    console.log(`?????? Server listening on port ${config.port}`);
  });
}

init();

export { RUN_PATH, DOWNLOAD_PATH, ECOSYSTEM_PATH };
