import axios from 'axios';
import { get, isArray } from 'lodash';
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

export const svgSymbolify = async (input: string) => {
  if (input.startsWith('http')) {
    return parseRemote(input);
  }

  return [];
};
