import { fetchUnstop } from './unstop';

async function test() {
  console.log('Fetching from Unstop...');
  try {
    const jobs = await fetchUnstop('software engineer', '');
    console.log(`Found ${jobs.length} jobs.`);
    if (jobs.length > 0) {
      console.log('Sample job:');
      console.log(JSON.stringify(jobs[0], null, 2));
    }
  } catch (error) {
    console.error('Error fetching Unstop:', error);
  }
}
test();
