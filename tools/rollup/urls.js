// plugin
import { resolve, dirname, basename, join } from "path";
import hasha from "hasha";
import { readFileSync } from "fs";
export default function URLResolverPlugin(assets) {
  const newAssets = {};

  return {
    name: "url-hash-resolver",
    resolveId(source, importer) {
      if (source in assets) {
        return resolve(source);
      }
    },
    async buildStart() {
      // Discover new assets from the manifest.
      assets.forEach((file) => {
        const dir = dirname(file);
        const name = basename(file);
        const contents = readFileSync(`client${file}`);
        const emit = this.emitFile({
          type: name.endsWith(".js") ? "chunk" : "asset",
          id: file,
          fileName: join(
            "./",
            dir,
            `${hasha.fromFileSync(`client${file}`, {
              algorithm: "md5",
            })}.${name}`
          ),
          source: contents,
        });

        newAssets[file] = join("/", this.getFileName(emit));

        console.log(`${file} => ${newAssets[file]}`);
      });
    },
    load(id) {
      if (id.endsWith("assets.js")) {
        // Load it so it can be transformed.
        return readFileSync(id, { encoding: "utf-8" });
      }
    },
    transform(source, id) {
      if (id.endsWith("assets.js")) {
        return {
          code: `export const assets = ${JSON.stringify(newAssets)}`,
          map: null,
        };
      }
    },
  };
}
