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

  it('parses a remote plain SVG document without iconfont script extraction', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '<svg><symbol id="plain-icon" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></symbol></svg>',
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(svgSymbolify('https://example.com/icons.svg')).resolves.toMatchObject([
      { attributes: { id: 'plain-icon' }, name: 'symbol' },
    ]);
  });

  it('throws with the URL and HTTP status when the remote request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(svgSymbolify('https://example.com/missing.js')).rejects.toThrow(
      'Failed to fetch remote SVG file: https://example.com/missing.js (HTTP 404)',
    );
  });

  it('throws with context when the remote content contains no symbols', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: async () => 'console.log("not an iconfont script")' }),
    );
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(svgSymbolify('https://example.com/iconfont.js')).rejects.toThrow(
      'Failed to parse remote SVG file: https://example.com/iconfont.js, no <symbol> found',
    );
  });

  it('throws with the file path and cause when a local SVG cannot be parsed', async () => {
    const directory = await createTemporaryDirectory();
    const file = join(directory, 'broken.svg');
    await writeFile(file, 'not xml at all');
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const error = (await svgSymbolify(file).catch((cause: unknown) => cause)) as Error;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(`Failed to parse local SVG file: ${file}`);
    expect(error.cause).toBeInstanceOf(Error);
  });

  it('throws with the path when the local input does not exist', async () => {
    const directory = await createTemporaryDirectory();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(svgSymbolify(join(directory, 'nope.svg'))).rejects.toThrow(
      `Failed to read local SVG path: ${join(directory, 'nope.svg')}`,
    );
  });
});
