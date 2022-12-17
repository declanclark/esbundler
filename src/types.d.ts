import type { ModuleInfo } from '@fal-works/esbuild-plugin-global-externals';

type BundleOptions = {
  files?: Record<string, string>;
  globals?: Record<string, string | ModuleInfo>;
};

export type Bundle = {
  source: string;
} & BundleOptions;
