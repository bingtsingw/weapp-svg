import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

const SVG = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>';
const execFile = promisify(execFileCallback);
const cli = new URL('../../bin/run', import.meta.url);
let directory = '';
let originalDirectory = '';

beforeEach(async () => {
  originalDirectory = process.cwd();
  directory = await mkdtemp(join(tmpdir(), 'wesvg-test-'));
  process.chdir(directory);
});

afterEach(async () => {
  process.chdir(originalDirectory);
  await rm(directory, { force: true, recursive: true });
});

describe('wesvg commands', () => {
  it('initializes configuration and generates components from command flags', async () => {
    await execFile(process.execPath, [cli.pathname, 'init'], { cwd: directory });
    await expect(readFile('wesvg.json', 'utf8')).resolves.toContain('"inputs":""');

    await writeFile('arrow-right.svg', SVG);
    await execFile(
      process.execPath,
      [cli.pathname, 'generate', '--inputs', './arrow-right.svg', '--output', 'icons', '--icon-size', '40'],
      {
        cwd: directory,
      },
    );

    await expect(readFile(join('icons', 'index.ts'), 'utf8')).resolves.toContain(
      "export { ArrowRight } from './icons/arrow-right';",
    );
    await expect(readFile(join('icons', 'icons', 'arrow-right.tsx'), 'utf8')).resolves.toContain('size = 40');
  });
});
