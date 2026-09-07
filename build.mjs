import { minify as jsmin } from 'terser';
import { minify as htmlmin } from 'html-minifier-terser';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const src = readFileSync('src.html', 'utf8');
const m = src.match(/<script>([\s\S]*?)<\/script>/);
const res = await jsmin(m[1], {
  ecma: 2020,
  compress: { passes: 4, unsafe: true, unsafe_arrows: true, unsafe_methods: true, pure_getters: true, booleans_as_integers: true, drop_console: true },
  mangle: { toplevel: true, properties: false },
  format: { comments: false }
});
if (res.error) throw res.error;
let html = src.replace(m[0], '<script>' + res.code + '</script>');
html = await htmlmin(html, {
  collapseWhitespace: true, removeComments: true, removeAttributeQuotes: true,
  removeOptionalTags: true, removeRedundantAttributes: true, collapseBooleanAttributes: true,
  minifyCSS: { level: 2 }, sortAttributes: true, sortClassName: true,
});
writeFileSync('dist/index.html', html);
execSync('cd dist && rm -f game.zip && zip -9 -q -X game.zip index.html');
const size = +execSync('stat -c%s dist/game.zip').toString().trim();
console.log(`min html: ${html.length}  zip: ${size} / 13312 (${(size/13312*100).toFixed(1)}%)`);
