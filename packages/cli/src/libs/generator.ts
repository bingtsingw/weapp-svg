import { readFileSync, writeFileSync } from 'fs';
import { emptyDirSync, ensureDirSync } from 'fs-extra';
import { dirname, join } from 'path';
import { svgEncode, unifyComponentName } from '../utils';
import { Configure } from './configure';
import { Template } from './template';

export class Generator {
  static output: string;

  static run() {
    this.output = Configure.getConfig().output;

    this.clearOutput();
    ensureDirSync(this.output);

    this.generateIndex();
    this.generateType();
    this.generateHook();
    this.generateIcons();
  }

  private static generateIndex() {
    this.generate('index.ts', Template.getIndex());
  }

  private static generateType() {
    this.generate('types.ts', Template.getType());
  }

  private static generateHook() {
    this.generate('hooks.ts', Template.getHook());
  }

  private static generateIcons() {
    const config = Configure.getConfig();
    const icons = Configure.getIcons();
    icons.forEach(({ name, data }) => {
      let template = Template.getIcon();

      template = template.replace(/#size#/g, String(config.iconSize));

      const componentName = unifyComponentName(name);
      template = template.replace(/#componentName#/g, componentName);

      template = template.replace(/#svg#/g, svgEncode(data, { hexToRgb: true }));

      this.generate(join('icons', `${name}.tsx`), template);
      this.prependIndex(componentName, name);
    });
  }

  private static prependIndex(componentName: string, fileName: string) {
    const path = join(this.output, 'index.ts');
    const content = readFileSync(path, 'utf8');
    writeFileSync(path, `export { ${componentName} } from './icons/${fileName}';\n${content}`);
  }

  private static generate(file: string, content: string) {
    const path = join(this.output, file);
    ensureDirSync(dirname(path));
    writeFileSync(path, content);
  }

  private static clearOutput() {
    emptyDirSync(this.output);
  }
}
