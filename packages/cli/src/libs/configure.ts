import { existsSync } from 'fs';
import { XmlData, fetchXml } from 'iconfont-parser';
import { isNil, kebabCase, omitBy } from 'lodash';
import { resolve } from 'path';
import { ZodError, z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { DEFAULTS } from '../constants';
import { SVGXmlItem } from '../interfaces';

const schema = z.object({
  output: z.string(),
  svgRemote: z.string(),
  iconTrimPrefix: z.string().optional(),
  iconSize: z.number().default(DEFAULTS.iconSize),
  iconComponentPrefix: z.string().optional(),
});

export type Config = z.infer<typeof schema>;

export class Configure {
  private static config: Config;
  private static remoteSvgData: XmlData;
  private static icons: { name: string; data: SVGXmlItem }[];

  static async init(configFlag: Partial<Config>, configPath?: string) {
    let config = {};

    // 优先读取CLI配置
    if (configPath) {
      const configFile = resolve(process.cwd(), configPath);
      if (existsSync(configFile)) {
        config = require(configFile);
      } else {
        // 当CLI配置的configPath不存在时, 报错
        throw new Error('config file not found');
      }
    } else {
      const configFile = resolve(process.cwd(), 'iconfont.json');
      // 当默认的configPath不存在时, 静默处理, 不报错
      if (existsSync(configFile)) {
        config = require(configFile);
      }
    }

    try {
      this.config = schema.parse({
        ...config,
        ...omitBy(configFlag, isNil),
      });
    } catch (err) {
      throw fromZodError(err as ZodError, { prefix: 'config validation error' });
    }

    await this.normalize();
  }

  static getConfig() {
    return this.config;
  }

  static getSvgData() {
    return this.remoteSvgData;
  }

  static getIcons() {
    return this.icons;
  }

  private static async normalize() {
    // calculate output
    const output = this.config.output;
    if (output.startsWith('/')) {
      throw new Error('output do not support absolute path');
    }
    this.config.output = resolve(process.cwd(), this.config.output);

    // calculate remoteSvgData
    try {
      this.remoteSvgData = await fetchXml(`http:${this.config.svgRemote}`);
    } catch (error) {
      throw new Error('remote svg url is invalid');
    }

    // calculate iconNames
    const svgData = this.getSvgData();
    this.icons = svgData.svg.symbol.map((item) => {
      const name = item.$.id;
      return {
        name: kebabCase(name.replace(new RegExp(`^${this.config.iconTrimPrefix ?? ''}-`), '')),
        data: item,
      };
    });
  }
}
