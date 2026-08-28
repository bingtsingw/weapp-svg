import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { exit } from 'node:process';
import { parseXml, XmlElement } from '@rgrove/parse-xml';

export type SvgSymbol = XmlElement;

const parseSvg = (source: string) => {
  const svg = parseXml(source).root;

  if (!svg || svg.name !== 'svg') {
    throw new Error('SVG root element not found');
  }

  return svg;
};

const parseRemote = async (input: string): Promise<SvgSymbol[]> => {
  console.log(`parsing icons from remote: ${input}`);

  try {
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`Failed to fetch remote SVG file: ${response.status}`);
    }
    const matches = (await response.text()).match(/'<svg>(.+?)<[/]svg>'/);

    try {
      if (matches) {
        const svg = parseSvg(`<svg>${matches[1]}</svg>`);
        const symbols = svg.children.filter(
          (child): child is XmlElement => child instanceof XmlElement && child.name === 'symbol',
        );

        if (symbols.length > 0) {
          return symbols;
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

  const symbols: SvgSymbol[] = [];
  try {
    const files = statSync(input).isDirectory() ? readdirSync(input).map((file) => resolve(input, file)) : [input];

    for (const file of files) {
      if (!file.endsWith('.svg')) {
        continue;
      }
      const svg = parseSvg(readFileSync(file, 'utf8'));
      svg.attributes['id'] = basename(file, '.svg');
      symbols.push(svg);
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
