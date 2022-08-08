import * as pm2 from 'pm2';
import { ECOSYSTEM_PATH } from '../index';
import { executeShellCommand } from './jsshell';

async function startPm2App(appName: string) {
  await executeShellCommand('/', 'pm2', [
    'start',
    ECOSYSTEM_PATH,
    '--only',
    appName,
  ]);
}

async function stopPm2App(appName: string) {
  await executeShellCommand('/', 'pm2', [
    'stop',
    ECOSYSTEM_PATH,
    '--only',
    appName,
  ]);
}

async function restartPm2App(appName: string) {
  await executeShellCommand('/', 'pm2', [
    'restart',
    ECOSYSTEM_PATH,
    '--only',
    appName,
  ]);
}

async function deletePm2App(appName: string) {
  await executeShellCommand('/', 'pm2', [
    'delete',
    ECOSYSTEM_PATH,
    '--only',
    appName,
  ]);
}

export { startPm2App, stopPm2App, restartPm2App, deletePm2App };
