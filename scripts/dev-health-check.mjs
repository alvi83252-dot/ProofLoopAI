import { existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const checks = {
  rootNodeModules: existsSync(join(root, 'node_modules', 'concurrently')),
  webNodeModules: existsSync(join(root, 'apps', 'web', 'node_modules', 'next')),
  apiNodeModules: existsSync(join(root, 'apps', 'api', 'node_modules', 'tsx'))
};

const missing = [];
if (!checks.rootNodeModules) missing.push('root (run: npm install)');
if (!checks.webNodeModules) missing.push('apps/web (run: npm install --prefix apps/web)');
if (!checks.apiNodeModules) missing.push('apps/api (run: npm install --prefix apps/api)');

if (missing.length > 0) {
  console.warn('\nMissing dependencies detected:');
  for (const item of missing) console.warn(`  - ${item}`);
  console.warn('\nRun `npm run install:all` from the repo root, then retry `npm run dev`.\n');
  process.exit(1);
}
