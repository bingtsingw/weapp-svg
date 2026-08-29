import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { parseXml, XmlElement } from '@rgrove/parse-xml';

export type SvgSymbol = XmlElement;

const parseSvg = (source: string) => {
  const svg = parseXml(source).root;

  if (!svg || svg.name !== 'svg') {
    throw new Error('SVG root element not found');
  }

  return svg;
};

const extractSymbols = (source: string): XmlElement[] => {
  const svg = parseSvg(source);

  return svg.children.filter((child): child is XmlElement => child instanceof XmlElement && child.name === 'symbol');
};

const parseRemote = async (input: string): Promise<SvgSymbol[]> => {
  console.log(`parsing icons from remote: ${input}`);

  let response: Response;
  try {
    response = await fetch(input);
  } catch (error) {
    throw new Error(`Failed to fetch remote SVG file: ${input}`, { cause: error });
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch remote SVG file: ${input} (HTTP ${response.status})`);
  }

  const content = await response.text();

  // 内容本身是 SVG/XML（如直链 .svg 或 sprite 文件）时直接解析
  try {
    const symbols = extractSymbols(content);
    if (symbols.length > 0) {
      return symbols;
    }
  } catch (_) {
    // 回退到 iconfont 脚本格式
  }

  // iconfont 的 symbol 脚本把 sprite 嵌在 JS 字符串里，需要先提取
  const matches = content.match(/['"]<svg>([\s\S]+?)<\/svg>['"]/);
  if (matches) {
    try {
      return extractSymbols(`<svg>${matches[1]}</svg>`);
    } catch (error) {
      throw new Error(`Failed to parse remote SVG file: ${input}`, { cause: error });
    }
  }

  throw new Error(
    `Failed to parse remote SVG file: ${input}, no <symbol> found, please confirm it is an iconfont symbol link`,
  );
};

const parseLocal = async (input: string): Promise<SvgSymbol[]> => {
  console.log(`parsing icons from local: ${input}`);

  let files: string[];
  try {
    files = statSync(input).isDirectory() ? readdirSync(input).map((file) => resolve(input, file)) : [input];
  } catch (error) {
    throw new Error(`Failed to read local SVG path: ${input}`, { cause: error });
  }

  const symbols: SvgSymbol[] = [];
  for (const file of files) {
    if (!file.endsWith('.svg')) {
      continue;
    }
    try {
      const svg = parseSvg(readFileSync(file, 'utf8'));
      svg.attributes['id'] = basename(file, '.svg');
      symbols.push(svg);
    } catch (error) {
      throw new Error(`Failed to parse local SVG file: ${file}`, { cause: error });
    }
  }

  return symbols;
};

export const svgSymbolify = async (input: string) => {
  if (input.startsWith('http')) {
    return parseRemote(input);
  } else {
    return parseLocal(input);
  }
};
