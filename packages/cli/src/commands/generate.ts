import { Command, Flags } from '@oclif/core';
import { DEFAULTS } from '../constants';
import { Configure } from '../libs/configure';
import { Generator } from '../libs/generator';

export default class Generate extends Command {
  public static aliases = ['g'];

  public static description = 'generate components';

  public static flags = {
    config: Flags.string({
      char: 'c',
      description: 'config file path',
      required: false,
    }),

    output: Flags.string({
      char: 'o',
      description: 'output dir for components',
      required: false,
    }),

    inputs: Flags.string({
      char: 'i',
      description: 'can be local or remote path',
      multiple: true,
      required: false,
    }),

    'icon-trim-prefix': Flags.string({
      char: 'p',
      description: 'trim prefix for icon name',
      required: false,
    }),

    'icon-size': Flags.integer({
      char: 's',
      description: 'default icon size',
      default: DEFAULTS.iconSize,
      required: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Generate);
    await Configure.init(
      {
        inputs: flags.inputs,
        output: flags.output,
        iconTrimPrefix: flags['icon-trim-prefix'],
        iconSize: flags['icon-size'],
      },
      flags.config,
    );
    Generator.run();
  }
}
