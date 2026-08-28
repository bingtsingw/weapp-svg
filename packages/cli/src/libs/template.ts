import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export class Template {
  public static getIndex() {
    return this.getTemplate('index.ts');
  }

  public static getType() {
    return this.getTemplate('types.ts');
  }

  public static getHook() {
    return this.getTemplate('hooks.ts');
  }

  public static getIcon() {
    return this.getTemplate('icon.tsx');
  }

  private static getTemplate(name: string) {
    const templateDirectory = existsSync(join(__dirname, 'templates'))
      ? join(__dirname, 'templates')
      : join(__dirname, '../templates');

    return readFileSync(join(templateDirectory, `${name}.template`), 'utf8').toString();
  }
}
