import fs from 'fs';
import https from 'https';
import path from 'path';
import Logger from './logger';

const download = async (
  url: string,
  targetPath: string,
) => {
  return new Promise<void>((resolve, reject) => {
    if (!url.startsWith('https')) {
      reject('URL must start with https');
    }
    

    Logger.info(`Downloading from ${url}`);
    Logger.info(`Downloading to ${targetPath}`);
    https.get(url, (res) => {
      const writeStream = fs.createWriteStream(targetPath);

      res.pipe(writeStream);
      writeStream.on('finish', () => {
        writeStream.close();
        resolve();
      });
    });
  });
};

export default download;
