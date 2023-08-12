/* eslint-disable */
// organize-imports-ignore
// prettier-ignore
import { View } from '@tarojs/components';
// prettier-ignore
import { FC } from 'react';
// prettier-ignore
import { useColor, useSize } from '../hooks';
// prettier-ignore
import { IconProps } from '../types';

// prettier-ignore
const quote = '"';

// prettier-ignore
export const IconArrowRightLine: FC<IconProps> = (props) => {
  const { size = 24, color, style = {}, className = '' } = props;
  const { colors, isStr } = useColor(color);
  const { svgSize } = useSize(size);

  return (
    <View style={{backgroundImage: `url(${quote}data:image/svg+xml, %3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='${svgSize}px' height='${svgSize}px'%3E%3Cpath d='M690.005333 469.333333l-228.864-228.864 60.330667-60.330666L853.333333 512l-331.861333 331.861333-60.330667-60.330666L690.005333 554.666667H170.666667v-85.333334h519.338666z' fill='${(isStr ? colors : colors?.[0]) || 'rgb(204,204,204)'}' /%3E%3C/svg%3E${quote})`, width: `${svgSize}px`, height: `${svgSize}px`, ...style}} className={className} />
  );
};
