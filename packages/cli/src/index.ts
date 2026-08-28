import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineCommand, runMain } from 'citty';
import { DEFAULTS } from './constants';
import { Configure } from './libs/configure';
import { Generator } from './libs/generator';

const collectInputs = (rawArgs: string[]) => {
  const inputs: string[] = [];

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg) {
      continue;
    }

    if (arg === '--inputs' || arg === '-i') {
      const input = rawArgs[index + 1];
      if (input) {
        inputs.push(input);
        index += 1;
      }
    } else if (arg.startsWith('--inputs=')) {
      inputs.push(arg.slice('--inputs='.length));
    }
  }

  return inputs.length > 0 ? inputs : undefined;
};

const generate = defineCommand({
  meta: {
    name: 'generate',
    alias: 'g',
    description: 'Generate icon components.',
  },
  args: {
    config: {
      type: 'string',
      alias: 'c',
      description: 'Configuration file path.',
    },
    output: {
      type: 'string',
      alias: 'o',
      description: 'Output directory for components.',
    },
    inputs: {
      type: 'string',
      alias: 'i',
      description: 'Local or remote input path; repeat this option to use multiple inputs.',
    },
    'icon-trim-prefix': {
      type: 'string',
      alias: 'p',
      description: 'Prefix to trim from icon names.',
    },
    'icon-size': {
      type: 'string',
      alias: 's',
      description: 'Default icon size.',
    },
  },
  async run({ args, rawArgs }) {
    const iconSize = args['icon-size'];

    await Configure.init(
      {
        inputs: collectInputs(rawArgs) ?? (args.inputs ? [args.inputs] : undefined),
        output: args.output,
        iconTrimPrefix: args['icon-trim-prefix'],
        iconSize: iconSize === undefined ? undefined : Number(iconSize),
      },
      args.config,
    );
    Generator.run();
  },
});

const init = defineCommand({
  meta: {
    name: 'init',
    description: 'Create an initial configuration file.',
  },
  run() {
    const configFile = resolve(process.cwd(), DEFAULTS.configPath);

    if (existsSync(configFile)) {
      throw new Error('config file already exists');
    }

    console.log(`create config file: ${configFile}`);
    console.log('you can modify it later');
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
  },
});

const main = defineCommand({
  meta: {
    name: 'wesvg',
    version: '0.4.0',
    description: 'Generate Taro React icon components from SVG sources.',
  },
  subCommands: {
    generate,
    init,
  },
});

runMain(main);
