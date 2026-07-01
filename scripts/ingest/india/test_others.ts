import { fetchHirist } from './hirist';
import { fetchFreshersworld } from './freshersworld';

async function test() {
  console.log('\n--- Testing Hirist ---');
  try {
    const jobs = await fetchHirist('software-engineer');
    console.log(`Found ${jobs.length} jobs.`);
    if (jobs.length > 0) {
      console.log('Sample job:');
      console.log(JSON.stringify(jobs[0], null, 2));
    }
  } catch (e) {
    console.error('Hirist error:', e);
  }

  console.log('\n--- Testing Freshersworld ---');
  try {
    const jobs = await fetchFreshersworld('software engineer');
    console.log(`Found ${jobs.length} jobs.`);
    if (jobs.length > 0) {
      console.log('Sample job:');
      console.log(JSON.stringify(jobs[0], null, 2));
    }
  } catch (e) {
    console.error('Freshersworld error:', e);
  }
}
test();
