// plugin
import { resolve, dirname, basename, join } from 'path';
import hasha from 'hasha';
import { readFileSync } from 'fs';
import { assets } from '../../views/helpers/assets.js';

export default function URLResolverPlugin() {

  const originalAssets = [
    ...Object.keys(assets)
  ];

  const newAssets = {}

  return ({
    name: "url-hash-resolver",
    resolveId(source, importer) {
      if (source in originalAssets) {
        return resolve(source);
      }
    },
    async buildStart() {
      // Discover new assets from the manifest.
      originalAssets.forEach(file => {
        const path = assets[file];
        const dir = dirname(path)
        const name = basename(path);
        const contents = readFileSync(`client${path}`);
        const emit = this.emitFile({
          type: name.endsWith(".js") ? "chunk" : "asset",
          id: path,
          fileName: join('./', dir, `${hasha(contents, { algorithm: 'md5' })}.${name}`),
          source: contents
        });

        newAssets[file] = join('/', this.getFileName(emit));

        console.log(`${file} => ${newAssets[file]}`)
      });
    },
    load(id) {
      if (id.endsWith('assets.js')) {
        // We need to generate the new asset graph.
        const referenceId = this.emitFile({
          type: 'chunk',
          id: id
        });
        return `export const assets = ${JSON.stringify(newAssets)};`;
      }
    }
  });
}