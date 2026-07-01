const fs = require('fs');
fetch('https://www.hirist.tech/search/software-engineer-jobs.html', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}).then(async r => {
  const text = await r.text();
  fs.writeFileSync('hirist.html', text);
});
