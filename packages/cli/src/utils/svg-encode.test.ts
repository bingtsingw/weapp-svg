import { XmlElement } from '@rgrove/parse-xml';
import { describe, expect, it } from 'vite-plus/test';
import { svgEncode } from './svg-encode';

describe('svgEncode', () => {
  it('encodes SVG markup and emits runtime color placeholders', () => {
    const result = svgEncode(
      new XmlElement('svg', { id: 'sample', viewBox: '0 0 24 24' }, [
        new XmlElement('path', { d: 'M0 0h24v24H0z', fill: '#ff0000' }),
      ]),
      { hexToRgb: true },
    );

    expect(result).toContain('data:image/svg+xml');
    expect(result).toContain("fill='${(isStr ? colors : colors?.[0]) || 'rgb(255,0,0)'}'");
    expect(result).toContain('%3Cpath');
  });

  it('encodes nested SVG elements from the parsed element tree', () => {
    const result = svgEncode(
      new XmlElement('svg', { viewBox: '0 0 24 24' }, [
        new XmlElement('g', { transform: 'translate(2 2)' }, [new XmlElement('path', { d: 'M0 0h20v20H0z' })]),
      ]),
    );

    expect(result).toContain("%3Cg transform='translate(2 2)'%3E");
    expect(result).toContain("%3Cpath d='M0 0h20v20H0z' fill='${(isStr ? color : color?.[0]) || '#CCCCCC'}' /%3E");
    expect(result).toContain('%3C/g%3E');
  });

  it('keeps color indexes for sibling elements of the same type', () => {
    const result = svgEncode(
      new XmlElement('svg', { viewBox: '0 0 24 24' }, [
        new XmlElement('path', { d: 'M0 0h12v24H0z', fill: '#ff0000' }),
        new XmlElement('path', { d: 'M12 0h12v24H12z', fill: '#00ff00' }),
      ]),
    );

    expect(result).toContain("fill='${(isStr ? color : color?.[0]) || '#ff0000'}'");
    expect(result).toContain("fill='${(isStr ? color : color?.[1]) || '#00ff00'}'");
  });
});
