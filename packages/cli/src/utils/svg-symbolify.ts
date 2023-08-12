import axios from 'axios';
import { readFileSync, readdirSync } from 'fs';
import { get, isArray } from 'lodash';
import { resolve } from 'path';
import { exit } from 'process';
import { Parser } from 'xml2js';

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
    const { data } = await axios.get<string>(input);
    const matches = String(data).match(/'<svg>(.+?)<\/svg>'/);

    try {
      const parser = new Parser();
      if (matches) {
        const result = await parser.parseStringPromise(`<svg>${matches[1]}</svg>`);
        const symbols = get(result, 'svg.symbol', []);

        if (isArray(symbols) && symbols.length > 0) {
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
    const files = readdirSync(input);

    for (const file of files) {
      if (!file.endsWith('.svg')) {
        continue;
      }
      const result = await parser.parseStringPromise(readFileSync(resolve(input, file), 'utf-8'));
      result.svg.$.id = file.replace(/\.svg$/, '');
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
