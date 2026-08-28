import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { svgEncode, unifyComponentName } from '../utils';
import { Configure } from './configure';
import { Template } from './template';

export class Generator {
  public static output: string;

  public static run() {
    this.output = Configure.getConfig().output;

    this.clearOutput();
    mkdirSync(this.output, { recursive: true });

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
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }

  private static clearOutput() {
    rmSync(this.output, { force: true, recursive: true });
  }
}
