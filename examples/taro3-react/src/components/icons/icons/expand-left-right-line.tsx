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
export const IconExpandLeftRightLine: FC<IconProps> = (props) => {
  const { size = 24, color, style = {}, className = '' } = props;
  const { colors, isStr } = useColor(color);
  const { svgSize } = useSize(size);

  return (
    <View style={{backgroundImage: `url(${quote}data:image/svg+xml, %3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' width='${svgSize}px' height='${svgSize}px'%3E%3Cpath d='M9.04304 5.79297 2.83594 12.0001 9.04304 18.2072 10.4573 16.793 5.66436 12.0001 10.4573 7.20718 9.04304 5.79297ZM14.957 18.2073 21.1641 12.0002 14.957 5.79312 13.5427 7.20733 18.3356 12.0002 13.5427 16.7931 14.957 18.2073Z' fill='${(isStr ? colors : colors?.[0]) || 'rgb(204,204,204)'}' /%3E%3C/svg%3E${quote})`, width: `${svgSize}px`, height: `${svgSize}px`, ...style}} className={className} />
  );
};
