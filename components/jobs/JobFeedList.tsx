'use client';

import { useState } from 'react';
import { JobCard } from './JobCard';
import { JobDetailDrawer } from './JobDetailDrawer';

interface JobFeedListProps {
  jobs: any[];
  userProfile?: any;
}

export function JobFeedList({ jobs, userProfile }: JobFeedListProps) {
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            userProfile={userProfile}
            onClick={() => setSelectedJob(job)}
          />
        ))}
      </div>

      <JobDetailDrawer
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
      />
    </>
  );
}
