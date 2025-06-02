import { existsSync } from 'fs';
import { readJSONSync } from 'fs-extra';
import { find, isArray, isNil, kebabCase, omitBy } from 'lodash';
import { resolve } from 'path';
import { DEFAULTS } from '../constants';
import type { SvgSymbol } from '../utils';
import { svgSymbolify } from '../utils';

interface Config {
  inputs: string[];
  output: string;
  iconTrimPrefix?: string;
  iconSize?: number;
  iconComponentPrefix?: string;
}

const validateConfig = (config: Config): Config => {
  const result = config;

  if (!Array.isArray(config.inputs)) {
    throw new Error('inputs must be an array');
  }

  for (const input of config.inputs) {
    if (typeof input !== 'string') {
      throw new Error('inputs must be an array of strings');
    }
  }

  if (!config.output || typeof config.output !== 'string') {
    throw new Error('output must be a string');
  }

  if (config.iconTrimPrefix && typeof config.iconTrimPrefix !== 'string') {
    throw new Error('iconTrimPrefix must be a string');
  }

  if (config.iconSize && typeof config.iconSize !== 'number') {
    throw new Error('iconSize must be a number');
  }

  if (!config.iconSize) {
    result.iconSize = DEFAULTS.iconSize;
  }

  if (config.iconComponentPrefix && typeof config.iconComponentPrefix !== 'string') {
    throw new Error('iconComponentPrefix must be a string');
  }

  return result;
};

export class Configure {
  private static config: Config;
  private static svgSymbols: SvgSymbol[] = [];
  private static icons: { name: string; data: SvgSymbol }[] = [];

  public static async init(configFlag: Partial<Config>, configPath?: string) {
    let config = {};

    // 优先读取CLI配置
    if (configPath) {
      const configFile = resolve(process.cwd(), configPath);
      if (existsSync(configFile)) {
        config = readJSONSync(configFile);
      } else {
        // 当CLI配置的configPath不存在时, 报错
        throw new Error('config file not found');
      }
    } else {
      const configFile = resolve(process.cwd(), DEFAULTS.configPath);
      // 当默认的configPath不存在时, 静默处理, 不报错
      if (existsSync(configFile)) {
        config = readJSONSync(configFile);
      }
    }

    const _config = { ...omitBy(config, isNil), ...omitBy(configFlag, isNil) } as unknown as Config;
    const _inputs = _config.inputs;

    this.config = validateConfig({
      ..._config,
      inputs: isArray(_inputs) ? _inputs : [_inputs],
    });

    await this.normalize();
  }

  public static getConfig() {
    return this.config;
  }

  public static getSvgSymbols() {
    return this.svgSymbols;
  }

  public static getIcons() {
    return this.icons;
  }

  private static async normalize() {
    // calculate output
    const output = this.config.output;
    if (output.startsWith('/')) {
      throw new Error('output do not support absolute path');
    }
    this.config.output = resolve(process.cwd(), this.config.output);

    // normalize inputs
    const inputs = this.config.inputs.map((input) => {
      if (input.startsWith('//')) {
        return `http:${input}`;
      }

      if (input.startsWith('.')) {
        return resolve(process.cwd(), input);
      }

      return input;
    });

    // calculate svgData
    for (const input of inputs) {
      this.svgSymbols = [...this.svgSymbols, ...(await svgSymbolify(input))];
    }

    // calculate iconNames
    const symbols = this.getSvgSymbols();
    for (const symbol of symbols) {
      const name = symbol.$.id;

      if (find(this.icons, { name })) {
        console.warn(`duplicate icon: ${name}`);
        continue;
      }

      this.icons.push({
        name: kebabCase(name.replace(new RegExp(`^${this.config.iconTrimPrefix ?? ''}-`), '')),
        data: symbol,
      });
    }
  }
}
