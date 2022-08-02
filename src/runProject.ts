import pm2 from 'pm2';
import Logger from './utils/logger';
import path from 'path';
import { ProjectConfig } from './models';

function runProject(project: ProjectConfig, rootFolderPath: string) {
  const startScriptFullPath = path.join(
    rootFolderPath,
    project.startScriptPath
  );

  return new Promise<void>((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        const errMsg = 'Cannot connect to pm2 deamon';
        Logger.error(errMsg, err);
        pm2.disconnect();
        reject(errMsg);
      }

      pm2.stop(project.projectName, (err) => {
        if (err) {
          Logger.info(`Cannot stop ${project.projectName}`);
        } else {
          Logger.success(`${project.projectName} successfully stopped`);
        }

        pm2.start(
          {
            name: project.projectName,
            script: startScriptFullPath,
            env: project.env,
          },
          (err) => {
            if (err) {
              Logger.error(`Error starting ${project.projectName}`, err);
              reject();
            } else {
              Logger.success(
                `${project.projectName} successfully started with env vars`,
                JSON.stringify(project.env, null, 2)
              );
              resolve();
            }
            pm2.disconnect();
          }
        );
      });
    });
  });
}

export { runProject };
