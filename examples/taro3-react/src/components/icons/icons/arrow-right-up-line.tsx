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
export const IconArrowRightUpLine: FC<IconProps> = (props) => {
  const { size = 24, color, style = {}, className = '' } = props;
  const { colors, isStr } = useColor(color);
  const { svgSize } = useSize(size);

  return (
    <View style={{backgroundImage: `url(${quote}data:image/svg+xml, %3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='${svgSize}px' height='${svgSize}px'%3E%3Cpath d='M682.837333 401.664l-367.232 367.232-60.330666-60.330667L622.506667 341.333333H298.794667V256h469.333333v469.333333h-85.333333V401.664z' fill='${(isStr ? colors : colors?.[0]) || 'rgb(204,204,204)'}' /%3E%3C/svg%3E${quote})`, width: `${svgSize}px`, height: `${svgSize}px`, ...style}} className={className} />
  );
};
