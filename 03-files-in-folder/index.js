const path = require('path');
const fs = require('fs');
const { readdir } = require('fs/promises');

const pathToFolder = path.join(__dirname, 'secret-folder');

async function logFilesInfo(pathToFolder) {
  try {
    const folderFiles = await readdir(pathToFolder, {withFileTypes: true});
    folderFiles.forEach(file => {
      if (file.isFile()) {
        fs.stat(path.join(pathToFolder, file.name), (err, stat) => {
          if (err) {
            console.log(err.message);
          } else {
            const pathToFile = path.join(pathToFolder, file.name);
            console.log(`${path.parse(pathToFile).name} - ${path.extname(pathToFile).slice(1)} - ${stat.size / 1000}Kb`);
          }
        });
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}

logFilesInfo(pathToFolder);


