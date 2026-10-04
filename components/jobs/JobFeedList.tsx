'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { JobCard } from './JobCard';
import { JobDetailDrawer } from './JobDetailDrawer';

interface JobFeedListProps {
  jobs: any[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

export function JobFeedList({ jobs }: JobFeedListProps) {
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5"
      >
        {jobs.map((job) => (
          <motion.div key={job.id} variants={itemVariants}>
            <JobCard
              job={job}
              onClick={() => setSelectedJob(job)}
            />
          </motion.div>
        ))}
      </motion.div>

      <JobDetailDrawer
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
      />
    </>
  );
}
