fetch('https://www.hirist.tech/search/software-engineer-jobs.html', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}).then(async r => {
  console.log("Status:", r.status);
  console.log("URL:", r.url);
  const text = await r.text();
  console.log("Text length:", text.length);
  console.log(text.substring(0, 500));
});
