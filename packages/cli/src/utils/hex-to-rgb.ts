export const hexToRgb = (hex: string) => {
  const rgb: number[] = [];

  // 去除前缀 # 号
  let _hex = hex.replace(/^#/, '');

  if (_hex.length === 3) {
    // 处理 '#abc' 成 '#aabbcc'
    _hex = _hex.replace(/(.)/g, '$1$1');
  }

  _hex.replace(/../g, (color: string) => {
    // 按16进制将字符串转换为数字
    rgb.push(parseInt(color, 0x10));

    return color;
  });

  return `rgb(${rgb.join(',')})`;
};
