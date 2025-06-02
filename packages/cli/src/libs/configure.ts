import { existsSync } from 'fs';
import { readJSONSync } from 'fs-extra';
import { find, isArray, isNil, kebabCase, omitBy } from 'lodash';
import { resolve } from 'path';
import type { ZodError } from 'zod';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { DEFAULTS } from '../constants';
import type { SvgSymbol } from '../utils';
import { svgSymbolify } from '../utils';

const schema = z.object({
  inputs: z.string().array(),
  output: z.string(),
  iconTrimPrefix: z.string().optional(),
  iconSize: z.number().default(DEFAULTS.iconSize),
  iconComponentPrefix: z.string().optional(),
});

export type Config = z.infer<typeof schema>;

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

    try {
      const _config = { ...omitBy(config, isNil), ...omitBy(configFlag, isNil) };
      const _inputs = _config.inputs;

      this.config = schema.parse({
        ..._config,
        inputs: isArray(_inputs) ? _inputs : [_inputs],
      });
    } catch (err) {
      throw fromZodError(err as ZodError, { prefix: 'config validation error' });
    }

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
