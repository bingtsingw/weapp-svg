import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { exit } from 'node:process';
import { Parser } from 'xml2js';
import { get } from '@xstools/utility/object';

export interface SvgSymbol {
  $: {
    viewBox: string;
    id: string;
  };
  path: Array<{
    $: {
      d: string;
      fill?: string;
    };
  }>;
}

const parseRemote = async (input: string): Promise<SvgSymbol[]> => {
  console.log(`parsing icons from remote: ${input}`);

  try {
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`Failed to fetch remote SVG file: ${response.status}`);
    }
    const matches = (await response.text()).match(/'<svg>(.+?)<\/svg>'/);

    try {
      const parser = new Parser();
      if (matches) {
        const result = await parser.parseStringPromise(`<svg>${matches[1]}</svg>`);
        const symbols = get(result, 'svg.symbol', []);

        if (Array.isArray(symbols) && symbols.length > 0) {
          return symbols as SvgSymbol[];
        }
      }

      console.log('Failed to parse remote SVG file: ', input);
    } catch (_) {
      console.log('Failed to parse remote SVG file: ', input);
    }
  } catch (_) {
    console.log('Failed to fetch remote SVG file: ', input);
  }

  exit(-1);
};

const parseLocal = async (input: string): Promise<SvgSymbol[]> => {
  console.log(`parsing icons from local: ${input}`);

  const parser = new Parser();
  const symbols: SvgSymbol[] = [];
  try {
    const files = statSync(input).isDirectory() ? readdirSync(input).map((file) => resolve(input, file)) : [input];

    for (const file of files) {
      if (!file.endsWith('.svg')) {
        continue;
      }
      const result = await parser.parseStringPromise(readFileSync(file, 'utf-8'));
      result.svg.$.id = basename(file, '.svg');
      symbols.push(result.svg);
    }

    return symbols;
  } catch (_) {
    console.log('Failed to parse local SVG file: ', input);
  }

  exit(-1);
};

export const svgSymbolify = async (input: string) => {
  if (input.startsWith('http')) {
    return parseRemote(input);
  } else {
    return parseLocal(input);
  }
};
