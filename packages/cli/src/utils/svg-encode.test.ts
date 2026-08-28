import { describe, expect, it } from 'vite-plus/test';
import { svgEncode } from './svg-encode';

describe('svgEncode', () => {
  it('encodes SVG markup and emits runtime color placeholders', () => {
    const result = svgEncode(
      {
        $: {
          id: 'sample',
          viewBox: '0 0 24 24',
        },
        path: [
          {
            $: {
              d: 'M0 0h24v24H0z',
              fill: '#ff0000',
            },
          },
        ],
      },
      { hexToRgb: true },
    );

    expect(result).toContain('data:image/svg+xml');
    expect(result).toContain("fill='${(isStr ? colors : colors?.[0]) || 'rgb(255,0,0)'}'");
    expect(result).toContain('%3Cpath');
  });
});
