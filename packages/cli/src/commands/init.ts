import { Command } from '@oclif/core';
import { existsSync } from 'fs';
import { writeJSONSync } from 'fs-extra';
import { resolve } from 'path';
import { DEFAULTS } from '../constants';

export default class Init extends Command {
  public static description = 'initial configuration';

  public async run(): Promise<void> {
    const configFile = resolve(process.cwd(), DEFAULTS.configPath);

    if (existsSync(configFile)) {
      this.error('config file already exists');
    } else {
      this.log(`create config file: ${configFile}`);
      this.log(`you can modify it later`);
      writeJSONSync(configFile, {
        inputs: '',
        output: '',
        iconTrimPrefix: '',
        iconSize: '',
        iconComponentPrefix: '',
      });
    }
  }
}
