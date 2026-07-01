import { fetchNaukri } from './naukri';

async function test() {
  console.log('Fetching from Naukri...');
  try {
    const jobs = await fetchNaukri('software engineer', 'india');
    console.log(`Found ${jobs.length} jobs.`);
    if (jobs.length > 0) {
      console.log('Sample job:');
      console.log(JSON.stringify(jobs[0], null, 2));
    }
  } catch (error) {
    console.error('Error fetching Naukri:', error);
  }
}
test();
