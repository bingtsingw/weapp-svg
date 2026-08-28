import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

const SVG = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>';
const execFile = promisify(execFileCallback);
const cli = new URL('../bin/wesvg', import.meta.url);
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

describe('wesvg CLI', () => {
  it('shows Citty-generated help for the available commands', async () => {
    const { stdout } = await execFile(process.execPath, [cli.pathname, '--help']);

    expect(stdout).toContain('generate, g');
    expect(stdout).toContain('init');
  });

  it('initializes configuration and generates components from repeated input flags', async () => {
    await execFile(process.execPath, [cli.pathname, 'init'], { cwd: directory });
    await expect(readFile('wesvg.json', 'utf8')).resolves.toContain('"inputs":""');

    await writeFile('arrow-right.svg', SVG);
    await writeFile('arrow-left.svg', SVG);
    await execFile(
      process.execPath,
      [
        cli.pathname,
        'g',
        '--inputs',
        './arrow-right.svg',
        '--inputs',
        './arrow-left.svg',
        '--output',
        'icons',
        '--icon-size',
        '40',
      ],
      {
        cwd: directory,
      },
    );

    await expect(readFile(join('icons', 'index.ts'), 'utf8')).resolves.toContain(
      "export { ArrowRight } from './icons/arrow-right';",
    );
    await expect(readFile(join('icons', 'index.ts'), 'utf8')).resolves.toContain(
      "export { ArrowLeft } from './icons/arrow-left';",
    );
    await expect(readFile(join('icons', 'icons', 'arrow-right.tsx'), 'utf8')).resolves.toContain('size = 40');
  });
});
