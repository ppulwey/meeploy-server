import express, { NextFunction, Request, Router, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs/promises';
import Logger from './utils/logger';
import download from './utils/download';
import path from 'path';
import { folderSetup } from './utils/setup';
import { Octokit } from 'octokit';
import { unzip } from './utils/zip';
import { OcotokitRepoList, ProjectConfig } from './models';
import { executeShellCommand } from './utils/jsshell';
import { WorkflowRun } from './models/WorkflowRun';
import pm2 from 'pm2';

dotenv.config();

const DOWNLOAD_PATH = path.join(__dirname, process.env.DOWNLOAD_PATH);
const RUN_PATH = path.join(__dirname, process.env.RUN_PATH);
const PROJECTS_PATH = path.join(__dirname, process.env.PROJECTS_PATH);

const app = express();
const port = process.env.PORT;
const router = Router();

app.use(cors());
app.use(express.json());

async function init() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
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
      const { repository } = req.body;

      // * Find project setting in config file
      let projectsConfig: ProjectConfig[] = [];
      try {
        const projectsFile = await fs.readFile(PROJECTS_PATH, {
          encoding: 'utf-8',
        });
        projectsConfig = JSON.parse(projectsFile) as ProjectConfig[];

        if (projectsConfig.length === 0) {
          throw Error();
        }
      } catch (error) {
        Logger.error('Projects file not found or corrupt');
        res.status(500).send('Projects file not found or corrupt');
        return;
      }

      const project = projectsConfig.find(
        (x) => x.repositoryName === repository.name
      );

      if (project === undefined) {
        res.status(500).send('Project not in projects file');
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
        res.status(404).send(`No artifacts for repo ${repository.name}`);
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
        res.sendStatus(octoResponse.status).send('Error from Octo');
        return;
      }

      try {
        await download(octoResponse.url, downloadFullPath);
      } catch (error) {
        res.sendStatus(500);
      }

      // * 3. Copy from download folder to run folder
      await fs.cp(downloadFullPath, runFullPath);

      // * 2. Unzip the build artifact
      const rootFolderPath = path.join(RUN_PATH, repository.name);
      try {
        await fs.stat(rootFolderPath);
        await fs.rm(rootFolderPath, { force: true, recursive: true });
      } catch (error) {
        Logger.info(`Root folder not found -> creating , ${rootFolderPath}`);
      }
      await fs.mkdir(rootFolderPath);
      await unzip(runFullPath, rootFolderPath);

      // * 4. Install dependencies
      await executeShellCommand(rootFolderPath, project.installCommand, []);

      pm2.connect((err) => {
        if (err) {
          const errMsg = 'Cannot connect to pm2 deamon';
          Logger.error(errMsg, err);
          res.status(500).send(errMsg);
          return;
        }

        // * Stop running project
        pm2.stop(project.projectName, (err) => {
          if (err) {
            Logger.error(`Error stopping ${project.projectName}`, err);
          } else {
            Logger.success(`${project.projectName} successfully stopped`);
          }
        });

        // * 5. Running project
        const startScriptFullPath = path.join(
          rootFolderPath,
          project.startScriptPath
        );
        pm2.start(
          {
            name: project.projectName,
            script: startScriptFullPath,
            env: project.env,
          },
          (err) => {
            if (err) {
              Logger.error(`Error starting ${project.projectName}`, err);
            } else {
              Logger.success(`${project.projectName} successfully started`);
            }
          }
        );

        pm2.disconnect();
      });

      res.send();
    }
  );

  app.use('/api/v1', router);

  app.listen(port, () => {
    console.log(`⚡️ Server listening on port ${port}`);
  });
}

init();

export { RUN_PATH, DOWNLOAD_PATH };
