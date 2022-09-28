import chalk from 'chalk';
import { spawn } from 'child_process';

import * as path from 'path';

const scriptFolderPath = path.join(process.cwd(), 'scripts');

enum SHELL_EVENTS {
  'start' = 'start',
  'signal' = 'signal',
  'error' = 'error',
  'end' = 'end',
}

function executeShellScript(
  executeFolder: string,
  commands: string[],
  onData?: (data: Buffer) => void,
  onError?: (err: Error) => void,
  onClose?: (code: number | null) => void
) {
  console.log(`Executing script in ${executeFolder}`);

  return new Promise<void>((resolve, reject) => {
    const cmd = spawn('sh', commands, {
      cwd: path.resolve(executeFolder),
      stdio: 'pipe',
      shell: true,
    });

    cmd.stdout.setEncoding('utf8');
    cmd.stderr.setEncoding('utf8');

    cmd.stdout.on('data', (data: Buffer) => {
      if (onData !== undefined) {
        onData(data);
      }
    });
    cmd.stderr.on('error', (err) => {
      if (onError !== undefined) {
        onError(err);
      }
      reject();
    });
    cmd.on('close', (code) => {
      if (onClose !== undefined) {
        onClose(code);
      }
      resolve();
    });
  });
}

function executeShellCommand(
  executeFolder: string,
  command: string,
  params: string[],
  env?: { [key: string]: string },
  onData?: (data: Buffer) => void,
  onError?: (err: Error) => void,
  onClose?: (code: number | null) => void
) {
  console.log(`Executing command ${chalk.bgGrey(command)} in ${executeFolder}`);

  return new Promise<void>((resolve, reject) => {
    const cmd = spawn(command, params, {
      cwd: path.resolve(executeFolder),
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        ...env,
      },
    });

    cmd.stdout.setEncoding('utf8');
    cmd.stderr.setEncoding('utf8');

    cmd.stdout.on('data', (data: Buffer) => {
      if (onData !== undefined) {
        onData(data);
      } else {
        console.log(data.toString());
      }
    });
    cmd.stderr.on('error', (err) => {
      if (onError !== undefined) {
        onError(err);
      } else {
        console.error(err);
      }
      reject();
    });
    cmd.on('close', (code) => {
      if (onClose !== undefined) {
        onClose(code);
      } else {
        console.log(`Process ended with code ${code}`);
      }
      resolve();
    });
  });
}

export {
  executeShellScript,
  executeShellCommand,
  SHELL_EVENTS,
  scriptFolderPath,
};
