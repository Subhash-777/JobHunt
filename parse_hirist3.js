const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('hirist_full.html', 'utf-8');
const $ = cheerio.load(html);

console.log("A tags:", $('a').length);
$('a').slice(0, 10).each((i, el) => {
  console.log($(el).attr('href'), $(el).text().substring(0, 50));
});

console.log("div classes:");
const divs = [];
$('div').each((i, el) => {
  if (el.attribs.class) divs.push(el.attribs.class);
});
console.log(Array.from(new Set(divs)).slice(0, 20));
