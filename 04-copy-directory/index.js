const path = require('path');
const { mkdir, copyFile, readdir, rm } = require('fs/promises');

const pathToFilesFolder = path.join(__dirname, 'files');
const pathToCopyFolder = path.join(__dirname, 'files-copy');

async function copyDirectoryFiles(pathToFilesFolder, pathToCopyFolder) {
  try {
    await rm(pathToCopyFolder, { recursive: true, force: true });
    await mkdir(pathToCopyFolder, {recursive: true});
    const folderFiles = await readdir(pathToFilesFolder, {withFileTypes: true});
    for (let file of folderFiles) {
      if (file.isDirectory()) {
        copyDirectoryFiles(path.join(pathToFilesFolder, file.name), path.join(pathToCopyFolder, file.name));
      } else {
        await copyFile(path.join(pathToFilesFolder, file.name), path.join(pathToCopyFolder, file.name));
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}

copyDirectoryFiles(pathToFilesFolder, pathToCopyFolder);