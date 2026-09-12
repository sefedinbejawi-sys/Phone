import fs from 'node:fs';

const file = 'src/data/initialData.ts';
let source = fs.readFileSync(file, 'utf8');
const replacements = [
  ['prod-iphone-16-pro-max', '/products/iphone-16-pro-max.jpg'],
  ['prod-iphone-15-pro-max', '/products/iphone-16-pro-max.jpg'],
  ['prod-samsung-s24-ultra', '/products/samsung-s24-ultra.jpg'],
  ['prod-google-pixel-8-pro', '/products/pixel-8-pro.jpg'],
  ['prod-iphone-14-pro-used', '/products/iphone-16-pro-max.jpg'],
  ['prod-redmi-note-13-pro-plus', '/products/pixel-8-pro.jpg'],
];
for (const [id, image] of replacements) {
  const block = new RegExp(`(id: '${id}',[\\s\\S]*?images: \\[)\\n\\s*'[^']+'`, 'm');
  source = source.replace(block, `$1\n      '${image}'`);
}
source = source.replace(/(id: 'prod-airpods-pro-2',[\s\S]*?images: \[)\n\s*'[^']+'/m, `$1\n      '/products/airpods-pro-2.jpg'`);
source = source.replace(/(id: 'prod-anker-powerbank',[\s\S]*?images: \[)\n\s*'[^']+'/m, `$1\n      '/products/anker-powerbank.jpg'`);
source = source.replace(/(id: 'prod-apple-charger-20w',[\s\S]*?images: \[)\n\s*'[^']+'/m, `$1\n      '/products/usb-c-cable.jpg'`);
fs.writeFileSync(file, source);
console.log('Updated local product image sources');
