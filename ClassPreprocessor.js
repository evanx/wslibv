
import fs from 'fs';
import mkdirp from 'mkdirp';
import pathl from 'path';
import * as Files from './Files';

const logger = Loggers.create(module.filename, 'debug');

export async function buildSync(sourceFile, names) { // regex this dereferencing on names
   if (!/^\.\//.test(sourceFile)) {
      throw 'unsupported: ' + sourceFile;
   }
   const buildDir = './build/';
   await Files.mkdirp(buildDir);
   const targetFile = sourceFile.replace(/^(\.\/[a-z]*)\//, buildDir);
   sourceFile = sourceFile.replace(/^./, module.filename.replace(/\/lib\/\w*\.js/, ''));
   if (!/\.js$/.test(sourceFile)) {
      sourceFile = sourceFile + '.js';
   }
   const sourceCode = fs.readFileSync(sourceFile).toString();
   logger.debug('source', sourceCode.length);
   const regex = `([^a-z\\.'])(${names.join('|')})([^-a-z:'])`;
   const replace = `\$1this.\$2$3`;
   logger.ndebug('buildSync regex', regex, replace);
   let translatedCode = sourceCode.replace(new RegExp(regex, 'g'), replace);
   translatedCode = translatedCode.split('\n').map((line, index) => {
      const translatedLine = line.replace(/\$lineNumber/, `'line:${index + 1}'`);
      logger.info('line', index, translatedLine);
      return translatedLine;
   }).join('\n');
   logger.ndebug('source', translatedCode);
   fs.writeFileSync(targetFile, translatedCode);
   return targetFile;
}
