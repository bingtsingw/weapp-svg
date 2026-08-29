import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { svgEncode, unifyComponentName } from '../utils';
import { Configure } from './configure';
import { Template } from './template';

interface IconExport {
  componentName: string;
  fileName: string;
}

export class Generator {
  public static output: string;

  public static run() {
    this.output = Configure.getConfig().output;

    this.clearOutput();
    mkdirSync(this.output, { recursive: true });

    this.generateType();
    this.generateColor();
    this.generateIndex(this.generateIcons());
  }

  private static generateIndex(icons: IconExport[]) {
    const lines = [...icons]
      .sort((a, b) => (a.componentName < b.componentName ? -1 : 1))
      .map(({ componentName, fileName }) => `export { ${componentName} } from './icons/${fileName}';`);
    const iconExports = lines.length > 0 ? `${lines.join('\n')}\n` : '';

    this.generate('index.ts', `${iconExports}${Template.getIndex()}`);
  }

  private static generateType() {
    this.generate('types.ts', Template.getType());
  }

  private static generateColor() {
    this.generate('color.ts', Template.getColor());
  }

  private static generateIcons(): IconExport[] {
    const config = Configure.getConfig();
    const icons = Configure.getIcons();
    const exports: IconExport[] = [];

    icons.forEach(({ name, data }) => {
      let template = Template.getIcon();

      template = template.replace(/#size#/g, String(config.iconSize));

      const componentName = unifyComponentName(name);
      template = template.replace(/#componentName#/g, componentName);

      template = template.replace(/#svg#/g, svgEncode(data, { hexToRgb: true }));

      this.generate(join('icons', `${name}.tsx`), template);
      exports.push({ componentName, fileName: name });
    });

    return exports;
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
