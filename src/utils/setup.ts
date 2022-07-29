import fs from 'fs/promises';
import { Octokit } from 'octokit';
import { DOWNLOAD_PATH, RUN_PATH } from '../index';
import Logger from './logger';

const folderSetup = async () => {
  let downloadPathExists = false;
  let runPathExists = false;

  try {
    await fs.stat(DOWNLOAD_PATH);
    downloadPathExists = true;
  } catch (error) {
    downloadPathExists = false;
  }

  try {
    await fs.stat(RUN_PATH);
    runPathExists = true;
  } catch (error) {
    runPathExists = false;
  }

  try {
    await fs.mkdir(DOWNLOAD_PATH, { recursive: true });
  } catch (error) {
    Logger.error('Error creating download folder', error);
    throw error;
  }

  try {
    await fs.mkdir(RUN_PATH, { recursive: true });
  } catch (error) {
    Logger.error('Error creating run folder', error);
    throw error;
  }
};

export { folderSetup };
