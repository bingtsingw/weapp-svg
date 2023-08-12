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
export const IconArrowLeftUpLine: FC<IconProps> = (props) => {
  const { size = 24, color, style = {}, className = '' } = props;
  const { colors, isStr } = useColor(color);
  const { svgSize } = useSize(size);

  return (
    <View style={{backgroundImage: `url(${quote}data:image/svg+xml, %3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='${svgSize}px' height='${svgSize}px'%3E%3Cpath d='M401.664 341.333333l367.232 367.232-60.330667 60.330667L341.333333 401.664V725.333333H256V256h469.333333v85.333333H401.664z' fill='${(isStr ? colors : colors?.[0]) || 'rgb(204,204,204)'}' /%3E%3C/svg%3E${quote})`, width: `${svgSize}px`, height: `${svgSize}px`, ...style}} className={className} />
  );
};
