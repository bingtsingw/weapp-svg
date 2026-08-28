import { caseCamel, caseUpperFirst } from '@xstools/utility/string';
import { Configure } from '../libs/configure';

export const unifyComponentName = (filename: string) => {
  const prefix = Configure.getConfig().iconComponentPrefix || '';

  return caseUpperFirst(caseCamel(`${prefix}-${filename}`));
};
