import { camelCase, upperFirst } from 'lodash';
import { Configure } from '../libs/configure';

export const unifyComponentName = (filename: string) => {
  const prefix = Configure.getConfig().iconComponentPrefix || '';

  return upperFirst(camelCase(`${prefix}-${filename}`));
};
