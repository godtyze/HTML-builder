const path = require('path');
const {mkdir, copyFile, readdir, rm} = require('fs/promises');
const fs = require('fs');

const pathToDist = path.join(__dirname, 'project-dist');
const pathToStyles = path.join(__dirname, 'styles');
const pathToAssets = path.join(__dirname, 'assets');
const pathToHTML = path.join(__dirname, 'template.html');
const pathToComponents = path.join(__dirname, 'components');

async function buildHTML(pathToHTML, pathToComponents) {
  try {
    const inputTemplate = fs.createReadStream(pathToHTML, 'utf-8');
    let templateData = '';
    inputTemplate.on('data', chunk => templateData += chunk);
    inputTemplate.on('end', async () => {
      const components = await readdir(pathToComponents, {withFileTypes: true});
      for (let component of components) {
        const inputComponents = fs.createReadStream(path.join(pathToComponents, component.name), 'utf-8');
        const componentName = path.basename(path.join(pathToComponents, component.name), '.html');
        let componentsData = '';
        inputComponents.on('data', chunk => componentsData += chunk);
        inputComponents.on('end', () => {
          templateData = templateData.replace(`    {{${componentName}}}`, componentsData);
          const output = fs.createWriteStream(path.join(pathToDist, 'index.html'));
          output.write(templateData);
        });
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function copyDirectoryFiles(pathToFilesFolder, pathToCopyFolder) {
  try {
    await rm(pathToCopyFolder, {recursive: true, force: true});
    await mkdir(pathToCopyFolder, {recursive: true});
    const folderFiles = await readdir(pathToFilesFolder, {withFileTypes: true});
    for await (let file of folderFiles) {
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

async function mergeStyles(pathToStylesFolder, pathToProjectDist) {
  try {
    const stylesFolder = await readdir(pathToStylesFolder, {withFileTypes: true});
    const output = fs.createWriteStream(path.join(pathToProjectDist, 'style.css'));
    const data = [];
    for await (let style of stylesFolder) {
      if (style.isFile() && style.name.includes('.css')) {
        const input = fs.createReadStream(path.join(pathToStylesFolder, style.name), 'utf-8');
        input.on('data', chunk => data.push(chunk));
        input.on('end', () => output.write(data.join('\n\n')));
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}

async function buildProject(pathToDist, pathToHTML, pathToComponents, pathToStyles, pathToAssets) {
  await rm(pathToDist, {recursive: true, force: true});
  await mkdir(pathToDist, {recursive: true});
  await mkdir(path.join(pathToDist, 'assets'), {recursive: true});
  buildHTML(pathToHTML, pathToComponents);
  mergeStyles(pathToStyles, pathToDist);
  copyDirectoryFiles(pathToAssets, path.join(pathToDist, 'assets'));
}

buildProject(pathToDist, pathToHTML, pathToComponents, pathToStyles, pathToAssets);