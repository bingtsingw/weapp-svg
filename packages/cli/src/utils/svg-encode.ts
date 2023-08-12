import { hexToRgb } from './hex-to-rgb';
import { SvgSymbol } from './svg-symbolify';

const ATTRIBUTE_FILL_MAP = ['path'];
const COLOR_ATTRIBUTE = ['fill', 'stroke', 'stop-color'];
const COLOR_ATTRIBUTE_IGNORE = ['none', 'url('];
const SINGLE_TAG = ['circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'use', 'stop'];

const addAttribute = (
  domName: string,
  sub: SvgSymbol['path'][number],
  counter: { colorIndex: number },
  config?: { hexToRgb: boolean },
  // eslint-disable-next-line max-params
) => {
  let template = '';

  if (sub && sub.$) {
    if (ATTRIBUTE_FILL_MAP.includes(domName)) {
      // Set default color same as in iconfont.cn
      // And create placeholder to inject color by user's behavior
      sub.$.fill = sub.$.fill || '#CCCCCC';
    }
    for (const attributeName of Object.keys(sub.$)) {
      // @ts-ignore
      const attributeValue = sub.$[attributeName];
      // 处理属性值为颜色的情况
      if (COLOR_ATTRIBUTE.includes(attributeName)) {
        if (COLOR_ATTRIBUTE_IGNORE.some((value) => attributeValue.includes(value))) {
          if (attributeValue.includes('url(#')) {
            // # 一定要转成 %23
            template += ` ${attributeName}='${encodeURIComponent(attributeValue)}'`;
          } else {
            template += ` ${attributeName}='${attributeValue}'`;
          }
          continue;
        }
        let color: string | undefined;
        let keyword: string;
        if (config?.hexToRgb) {
          color = hexToRgb(attributeValue);
          keyword = 'colors';
        } else {
          keyword = 'color';
          color = attributeValue;
        }
        template += ` ${attributeName}='$\{(isStr ? ${keyword} : ${keyword}?.[${counter.colorIndex}]) || '${color}'}'`;
        counter.colorIndex += 1;
      } else {
        template += ` ${attributeName}='${attributeValue}'`;
      }
    }
  }

  return template;
};

const generateXML = (data: SvgSymbol, config?: { hexToRgb: boolean }) => {
  let template = '';

  for (const domName of Object.keys(data)) {
    if (domName === '$') {
      continue;
    }

    const counter = {
      colorIndex: 0,
    };

    // @ts-ignore
    if (data[domName].$) {
      // @ts-ignore
      template += `<${domName}${addAttribute(domName, data[domName], counter, config)} />`;
      // @ts-ignore
    } else if (Array.isArray(data[domName])) {
      // @ts-ignore
      data[domName].forEach((sub) => {
        if (SINGLE_TAG.includes(domName)) {
          // 开标签
          template += `<${domName}${addAttribute(domName, sub, counter, config)} />`;
        } else {
          // 开标签
          template += `<${domName}${addAttribute(domName, sub, counter, config)}>`;
          // 递归子标签
          template += generateXML(sub, config);
          // 闭标签
          template += `</${domName}>`;
        }
      });
    }
  }
  return template;
};

export const svgEncode = (data: SvgSymbol, config?: { hexToRgb: boolean }) => {
  let template = `$\{quote}data:image/svg+xml, <svg viewBox='${data.$.viewBox}' xmlns='http://www.w3.org/2000/svg' width='$\{svgSize}px' height='$\{svgSize}px'>#content#</svg>$\{quote}`;

  return template
    .replace('#content#', generateXML(data, config))
    .replace(/<|>/g, (matched) => encodeURIComponent(matched));
};
