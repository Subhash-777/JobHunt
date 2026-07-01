const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('hirist.html', 'utf-8');
const $ = cheerio.load(html);

let jsonStr = '';
$('script').each((i, el) => {
  const content = $(el).html() || '';
  if (content.startsWith('{"props":')) {
    jsonStr = content;
  }
});

if (jsonStr) {
  const data = JSON.parse(jsonStr);
  const jobs = data.props.pageProps.jobList || data.props.pageProps.initialState?.jobList || [];
  console.log("Found jobs in JSON:", Array.isArray(jobs) ? jobs.length : 'unknown path');
  // let's just stringify and grep for job titles
  fs.writeFileSync('hirist_jobs.json', JSON.stringify(data, null, 2));
} else {
  console.log("No JSON blob found");
}
