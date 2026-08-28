import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { svgSymbolify } from './svg-symbolify';

const SVG = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>';
const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'wesvg-test-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('svgSymbolify', () => {
  it('parses a single local SVG file and uses its filename as the icon ID', async () => {
    const directory = await createTemporaryDirectory();
    const file = join(directory, 'arrow-left.svg');
    await writeFile(file, SVG);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(svgSymbolify(file)).resolves.toMatchObject([
      {
        attributes: {
          id: 'arrow-left',
          viewBox: '0 0 24 24',
        },
        name: 'svg',
      },
    ]);
  });

  it('parses SVG files from a directory and ignores unrelated files', async () => {
    const directory = await createTemporaryDirectory();
    await writeFile(join(directory, 'first.svg'), SVG);
    await writeFile(join(directory, 'notes.txt'), 'ignore me');
    await writeFile(join(directory, 'second.svg'), SVG);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(svgSymbolify(directory)).resolves.toMatchObject([
      { attributes: { id: 'first' }, name: 'svg' },
      { attributes: { id: 'second' }, name: 'svg' },
    ]);
  });

  it('parses icons from a remote iconfont script', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        '\'<svg><symbol id="remote-icon" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></symbol></svg>\'',
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(svgSymbolify('https://example.com/iconfont.js')).resolves.toMatchObject([
      {
        attributes: {
          id: 'remote-icon',
          viewBox: '0 0 24 24',
        },
        name: 'symbol',
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/iconfont.js');
  });
});
