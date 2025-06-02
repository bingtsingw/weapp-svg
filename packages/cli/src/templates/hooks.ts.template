import { canIUse, ENV_TYPE, getEnv, getSystemInfoSync, getWindowInfo } from '@tarojs/taro';
import { useEffect, useState } from 'react';

function getWindowWidth() {
  const isWeApp = getEnv() === ENV_TYPE.WEAPP;

  if (isWeApp && canIUse('getWindowInfo')) {
    return getWindowInfo().windowWidth;
  }

  return getSystemInfoSync().windowWidth;
}

function hex2rgb(hex: string) {
  let rgb: number[] = [];

  let _hex = hex.substring(1);

  if (_hex.length === 3) {
    _hex = _hex.replace(/(.)/g, '$1$1');
  }

  _hex.replace(/../g, (color: string) => {
    rgb.push(parseInt(color, 0x10));
    return color;
  });

  return `rgb(${rgb.join(',')})`;
}

export const useColor = (color?: string | string[]) => {
  const [colors, setColors] = useState<string | string[]>();
  const [isStr, setIsStr] = useState(true);

  useEffect(() => {
    setIsStr(typeof color === 'string');
    if (typeof color === 'string') {
      setColors(color.indexOf('#') === 0 ? hex2rgb(color) : color);
    } else {
      setColors(
        color?.map((item) => {
          return item.indexOf('#') === 0 ? hex2rgb(item) : item;
        }),
      );
    }
    return () => {};
  }, [color]);

  return { colors, isStr };
};

export const useSize = (size: number) => {
  const [svgSize, setSvgSize] = useState(size);

  useEffect(() => {
    setSvgSize(parseFloat(String((size / 375) * getWindowWidth())));
  }, [size]);

  return { svgSize };
};
