const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('hirist_full.html', 'utf-8');
const $ = cheerio.load(html);

console.log($('script[id="__NEXT_DATA__"]').html() ? "Has NEXT DATA" : "No NEXT DATA");
console.log(html.substring(0, 1000));
