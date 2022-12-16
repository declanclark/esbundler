import path from 'path';
import * as esbuild from 'esbuild';
import { v4 as uuid } from 'uuid';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';
import {
  globalExternals,
  ModuleInfo,
} from '@fal-works/esbuild-plugin-global-externals';
import { StringDecoder } from 'string_decoder';
import type { Plugin, Loader, Format } from 'esbuild';

type BundleOptions = {
  files?: Record<string, string>;
  globals?: Record<string, string | ModuleInfo>;
};

type Bundle = {
  source: string;
} & BundleOptions;

async function bundle({ source, files = {}, globals = {} }: Bundle) {
  const absoluteFiles: Record<string, string> = {};
  const cwd = path.join(process.cwd(), '__esbundler_fake_dir__');

  if (typeof source !== 'string') throw new Error('`source` must be a string!');

  const entryPath = path.join(cwd, `./esbundler_entry_point-${uuid()}.ts`);
  absoluteFiles[entryPath] = source;

  for (const [filePath, fileCode] of Object.entries(files)) {
    absoluteFiles[path.join(cwd, filePath)] = fileCode;
  }

  const inMemoryPlugin: Plugin = {
    name: 'inMemory',
    setup(build) {
      build.onResolve({ filter: /.*/ }, ({ path: filePath, importer }) => {
        if (filePath === entryPath) {
          return {
            path: filePath,
            pluginData: { inMemory: true, contents: absoluteFiles[filePath] },
          };
        }

        const modulePath = path.resolve(path.dirname(importer), filePath);

        if (modulePath in absoluteFiles) {
          return {
            path: modulePath,
            pluginData: { inMemory: true, contents: absoluteFiles[modulePath] },
          };
        }

        for (const ext of ['.js', '.ts', '.json']) {
          const fullModulePath = `${modulePath}${ext}`;
          if (fullModulePath in absoluteFiles) {
            return {
              path: fullModulePath,
              pluginData: {
                inMemory: true,
                contents: absoluteFiles[fullModulePath],
              },
            };
          }
        }

        return {};
      });

      build.onLoad({ filter: /.*/ }, async ({ path: filePath, pluginData }) => {
        if (pluginData === undefined || !pluginData.inMemory) {
          return null;
        }

        const fileType = (path.extname(filePath) || '.ts').slice(1);
        const contents = absoluteFiles[filePath];

        let loader: Loader;

        if (
          build.initialOptions.loader &&
          build.initialOptions.loader[`.${fileType}`]
        ) {
          loader = build.initialOptions.loader[`.${fileType}`];
        } else {
          loader = fileType as Loader;
        }

        return {
          contents,
          loader,
        };
      });
    },
  };

  const buildOptions = {
    entryPoints: [entryPath],
    write: false,
    absWorkingDir: cwd,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [
      globalExternals(globals),
      NodeResolvePlugin({
        extensions: ['.js', '.ts'],
        resolveOptions: { basedir: cwd },
      }),
      inMemoryPlugin,
    ],
    bundle: true,
    minify: true,
    format: 'iife' as Format,
    globalName: 'Bundle',
  };

  const bundled = await esbuild.build(buildOptions);

  if (!bundled.outputFiles) throw new Error('Did not receive output files!');
  const decoder = new StringDecoder('utf-8');
  const code = decoder.write(Buffer.from(bundled.outputFiles[0].contents));

  return { code: `${code}return Bundle;`, errors: bundled.errors };
}

export { bundle };
