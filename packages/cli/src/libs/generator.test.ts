import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { Configure } from './configure';
import { Generator } from './generator';

const SVG = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="#ff0000" /></svg>';
let directory = '';
let originalDirectory = '';

beforeEach(async () => {
  originalDirectory = process.cwd();
  directory = await mkdtemp(join(tmpdir(), 'wesvg-test-'));
  process.chdir(directory);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(async () => {
  process.chdir(originalDirectory);
  await rm(directory, { force: true, recursive: true });
  vi.restoreAllMocks();
});

describe('Generator', () => {
  it('generates an icon package from a single local SVG file', async () => {
    await writeFile('arrow-left.svg', SVG);

    await Configure.init({
      iconComponentPrefix: 'app',
      iconSize: 32,
      iconTrimPrefix: 'arrow',
      inputs: ['./arrow-left.svg'],
      output: 'icons',
    });
    Generator.run();

    await expect(readFile(join('icons', 'index.ts'), 'utf8')).resolves.toContain(
      "export { AppLeft } from './icons/left';",
    );
    const component = await readFile(join('icons', 'icons', 'left.tsx'), 'utf8');
    expect(component).toContain('size = 32');
    expect(component).toContain('rgb(255,0,0)');
    // px 渲染走 pxTransform，不再有运行时 state/effect
    expect(component).toContain('const svgSize = Taro.pxTransform(size);');
    expect(component).not.toContain('useSize');
    expect(component).not.toContain('useState');
    expect(component).not.toContain('useEffect');
    // 组件变量名与 svgEncode 注入的占位符表达式严格对应
    expect(component).toContain("const isStr = typeof color === 'string';");
    expect(component).toContain('const colors = normalizeColor(color);');
    expect(component).toContain("(isStr ? colors : colors?.[0]) || 'rgb(255,0,0)'");
    await expect(readFile(join('icons', 'color.ts'), 'utf8')).resolves.toContain('export const normalizeColor');
    await expect(readFile(join('icons', 'types.ts'), 'utf8')).resolves.toContain('export interface IconProps');
  });

  it('clears parsed icon state before each generation run', async () => {
    await writeFile('first.svg', SVG);
    await writeFile('second.svg', SVG);

    await Configure.init({ inputs: ['./first.svg'], output: 'first-icons' });
    await Configure.init({ inputs: ['./second.svg'], output: 'second-icons' });
    Generator.run();

    await expect(readFile(join('second-icons', 'index.ts'), 'utf8')).resolves.toContain('./icons/second');
    await expect(readFile(join('second-icons', 'index.ts'), 'utf8')).resolves.not.toContain('./icons/first');
  });
});
