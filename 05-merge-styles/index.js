const path = require('path');
const { readdir } = require('fs/promises');
const fs = require('fs');

const pathToStylesFolder = path.join(__dirname, 'styles');
const pathToProjectDist = path.join(__dirname, 'project-dist');

async function mergeStyles(pathToStylesFolder, pathToProjectDist) {
  try {
    const stylesFolder = await readdir(pathToStylesFolder, {withFileTypes: true});
    const output = fs.createWriteStream(path.join(pathToProjectDist, 'bundle.css'));
    for (let style of stylesFolder) {
      if (style.isFile() && style.name.includes('.css')) {
        const input = fs.createReadStream(path.join(pathToStylesFolder, style.name), 'utf-8');
        input.pipe(output);
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}

mergeStyles(pathToStylesFolder, pathToProjectDist);