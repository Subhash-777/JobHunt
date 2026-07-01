'use client';

import { useState } from 'react';
import { NormalizedJob } from '@/scripts/ingest/types';
import { JobCard } from './JobCard';
import { JobDetailDrawer } from './JobDetailDrawer';

interface JobFeedListProps {
  jobs: (NormalizedJob & { id: string })[];
}

export function JobFeedList({ jobs }: JobFeedListProps) {
  const [selectedJob, setSelectedJob] = useState<(NormalizedJob & { id: string }) | null>(null);

  return (
    <>
      <div className="flex flex-col gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
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
