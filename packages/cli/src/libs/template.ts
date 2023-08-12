import { readFileSync } from 'fs';
import { join } from 'path';

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
    return readFileSync(join(__dirname, '../templates', `${name}.template`), 'utf8').toString();
  }
}
