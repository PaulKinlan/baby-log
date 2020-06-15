import arg from "arg";
import path from "path";
import * as fs from "fs";
const { readdir } = fs.promises;

const args = arg({
  // Types
  "--origin": String, // --host <string> or --host=<string>
  "--dir": [String],
  "--ignore": [String],
  // Aliases
  "-o": "--origin",
});

const findAny = (regexArray, value) => {
  return regexArray.some((regex) => regex.test(value));
};

let process = async (directory, origin, root, ignore) => {
  let urls = new Set();
  let allFiles = await readdir(`${directory}`, {
    withFileTypes: true,
    encoding: "utf8",
  });

  let directories = allFiles
    .filter((file) => file.isDirectory())
    .map((dir) => path.join(directory, dir.name));
  let files = allFiles.filter(
    (file) =>
      file.isFile() &&
      findAny(ignore, path.join(directory.replace(root, "/"), file.name)) ==
        false &&
      file.name.startsWith(".") === false
  );

  // Process the results
  files.forEach((file) =>
    urls.add(path.join(directory.replace(root, "/"), file.name))
  );

  for (let directory of directories) {
    const newUrls = await process(directory, origin, root, ignore);
    urls = new Set([...urls, ...newUrls]);
  }

  return urls;
};

const go = async (directories, origin, ignore) => {
  let urls = new Set();
  for (let directory of directories) {
    const newUrls = await process(
      directory,
      origin,
      directory,
      ignore.map((i) => new RegExp(i))
    );
    urls = new Set([...urls, ...newUrls]);
  }
  console.log(JSON.stringify(Array.from(urls.values())));
};

go(args["--dir"] || ["."], args["--origin"], args["--ignore"] || []);
