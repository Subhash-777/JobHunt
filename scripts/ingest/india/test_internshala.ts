import { fetchInternshala } from './internshala';

async function test() {
  console.log('Fetching from Internshala...');
  try {
    const jobs = await fetchInternshala('software-development', 'bangalore');
    console.log(`Found ${jobs.length} jobs.`);
    if (jobs.length > 0) {
      console.log('Sample job:');
      console.log(JSON.stringify(jobs[0], null, 2));
      
      const ppoJobs = jobs.filter(j => j.is_ppo_mentioned);
      const earlyJobs = jobs.filter(j => j.is_early_applicant);
      
      console.log(`\nPPO Jobs: ${ppoJobs.length}`);
      console.log(`Early Applicant Jobs: ${earlyJobs.length}`);
    }
  } catch (error) {
    console.error('Error fetching:', error);
  }
}
test();
