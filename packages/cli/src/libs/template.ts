import { readFileSync } from 'fs';
import { join } from 'path';

export class Template {
  static getIndex() {
    return this.getTemplate('index.ts');
  }

  static getType() {
    return this.getTemplate('types.ts');
  }

  static getHook() {
    return this.getTemplate('hooks.ts');
  }

  static getIcon() {
    return this.getTemplate('icon.tsx');
  }

  private static getTemplate(name: string) {
    return readFileSync(join(__dirname, '../templates', `${name}.template`), 'utf8').toString();
  }
}
