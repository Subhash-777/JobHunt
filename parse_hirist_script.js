const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('hirist.html', 'utf-8');
const $ = cheerio.load(html);

$('script').each((i, el) => {
  const content = $(el).html() || '';
  if (content.length > 1000) {
    console.log("Script", i, "length:", content.length);
    console.log(content.substring(0, 100) + "...");
  }
});
