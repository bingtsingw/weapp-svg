import { Command } from '@oclif/core';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
      writeFileSync(
        configFile,
        JSON.stringify({
          inputs: '',
          output: '',
          iconTrimPrefix: '',
          iconSize: '',
          iconComponentPrefix: '',
        }),
      );
    }
  }
}
