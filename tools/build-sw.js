import arg from 'arg';
import path from 'path';
import * as fs from 'fs';
const { readdir } = fs.promises;

const args = arg({
  // Types
  '--origin': String,      // --host <string> or --host=<string>
  '--dir': [String],
  // Aliases
  '-o': '--origin'
});

let process = async (directory, origin, root) => {
  let urls = new Set();
  let allFiles = await readdir(`${directory}`, { withFileTypes: true, encoding: 'utf8' });

  let directories = allFiles.filter(file => file.isDirectory()).map(dir => path.join(directory, dir.name));
  let files = allFiles.filter(file => file.isFile() && file.name.startsWith('.') === false);

  // Process the results
  files.forEach(file => urls.add(path.join(directory.replace(root, '/'), file.name)));
  
  for (let directory of directories) {
    const newUrls = await process(directory, origin, root);
    urls = new Set([...urls, ...newUrls]);
  }

  return urls;
}

const go = async (directories, origin) => {
  let urls = new Set();
  for (let directory of directories) {
    const newUrls = await process(directory, origin, directory);
    urls = new Set([...urls, ...newUrls]);
  }
  console.log(JSON.stringify(Array.from(urls.values())));
}

go(args['--dir'] || ['.'], args['--origin']);
