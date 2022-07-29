import fs from 'fs/promises';
import JSZip from 'jszip';
import path from 'path';
import Logger from './logger';

const unzip = async (zipFilePath: string, rootFolderPath: string) => {
  Logger.info('Unzipping');
  const fileContent = await fs.readFile(zipFilePath);
  const jszip = new JSZip();
  const result = await jszip.loadAsync(fileContent);
  const keys = Object.keys(result.files);

  for (const currKey of keys) {
    const item = result.files[currKey];

    if (item.dir) {
      try {
        const folderPath = path.join(rootFolderPath, item.name);
        await fs.mkdir(folderPath, { recursive: true });
      } catch (error) {
        continue;
      }
    } else {
      const filePath = path.join(rootFolderPath, item.name);
      await fs.writeFile(
        filePath,
        Buffer.from(await item.async('arraybuffer'))
      );
    }
  }
};

export { unzip };
