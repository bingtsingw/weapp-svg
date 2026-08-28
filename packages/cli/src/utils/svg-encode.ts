import { XmlElement } from '@rgrove/parse-xml';
import { hexToRgb } from './hex-to-rgb';
import type { SvgSymbol } from './svg-symbolify';

const ATTRIBUTE_FILL_MAP = ['path'];
const COLOR_ATTRIBUTE = ['fill', 'stroke', 'stop-color'];
const COLOR_ATTRIBUTE_IGNORE = ['none', 'url('];
const SINGLE_TAG = ['circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'use', 'stop'];

const addAttribute = (
  domName: string,
  element: XmlElement,
  counter: { colorIndex: number },
  config?: { hexToRgb: boolean },
) => {
  let template = '';
  const attributes = { ...element.attributes };

  if (ATTRIBUTE_FILL_MAP.includes(domName)) {
    // Set default color same as in iconfont.cn
    // And create placeholder to inject color by user's behavior
    attributes['fill'] = attributes['fill'] || '#CCCCCC';
  }

  for (const [attributeName, attributeValue] of Object.entries(attributes)) {
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

  return template;
};

const generateXML = (data: SvgSymbol, config?: { hexToRgb: boolean }) => {
  let template = '';

  for (const element of data.children) {
    if (!(element instanceof XmlElement)) {
      continue;
    }

    const counter = { colorIndex: 0 };
    if (SINGLE_TAG.includes(element.name)) {
      template += `<${element.name}${addAttribute(element.name, element, counter, config)} />`;
    } else {
      template += `<${element.name}${addAttribute(element.name, element, counter, config)}>`;
      template += generateXML(element, config);
      template += `</${element.name}>`;
    }
  }

  return template;
};

export const svgEncode = (data: SvgSymbol, config?: { hexToRgb: boolean }) => {
  const viewBox = data.attributes['viewBox'] ?? '';
  let template = `$\{quote}data:image/svg+xml, <svg viewBox='${viewBox}' xmlns='http://www.w3.org/2000/svg' width='$\{svgSize}px' height='$\{svgSize}px'>#content#</svg>$\{quote}`;

  return template
    .replace('#content#', generateXML(data, config))
    .replace(/<|>/g, (matched) => encodeURIComponent(matched));
};
