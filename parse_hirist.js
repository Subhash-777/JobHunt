const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('hirist_full.html', 'utf-8');
const $ = cheerio.load(html);

const classes = [];
$('*').each((i, el) => {
  if (el.attribs.class && el.attribs.class.includes('job')) {
    classes.push(el.attribs.class);
  }
});
console.log(Array.from(new Set(classes)).slice(0, 20));
