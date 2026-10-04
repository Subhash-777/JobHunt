export interface EligibilityResult {
  status: 'eligible' | 'partial' | 'high_bar' | 'unknown';
  reasons: string[];
  cgpaMet?: boolean;
  batchMet?: boolean;
  branchMet?: boolean;
  degreeMet?: boolean;
}

export function evaluateEligibility(job: any, profile: any): EligibilityResult {
  if (!profile) {
    return { status: 'unknown', reasons: ['Complete profile to see eligibility'] };
  }

  const reasons: string[] = [];
  let eligibleCount = 0;
  let totalCriteria = 0;

  // 1. CGPA Cutoff
  let cgpaMet: boolean | undefined = undefined;
  if (job.cgpa_cutoff != null) {
    totalCriteria++;
    if (profile.cgpa != null) {
      cgpaMet = Number(profile.cgpa) >= Number(job.cgpa_cutoff);
      if (cgpaMet) {
        eligibleCount++;
      } else {
        reasons.push(`CGPA ${profile.cgpa} is below cutoff ${job.cgpa_cutoff}`);
      }
    } else {
      reasons.push(`CGPA not specified in profile (cutoff ${job.cgpa_cutoff})`);
    }
  }

  // 2. Target Batch Year
  let batchMet: boolean | undefined = undefined;
  if (job.batch_years && Array.isArray(job.batch_years) && job.batch_years.length > 0) {
    totalCriteria++;
    if (profile.graduation_year != null) {
      batchMet = job.batch_years.includes(Number(profile.graduation_year));
      if (batchMet) {
        eligibleCount++;
      } else {
        reasons.push(`Graduation year ${profile.graduation_year} not in target batches (${job.batch_years.join(', ')})`);
      }
    } else {
      reasons.push(`Graduation year not set in profile`);
    }
  }

  // 3. Branch / Major
  let branchMet: boolean | undefined = undefined;
  if (job.branch_required && Array.isArray(job.branch_required) && job.branch_required.length > 0) {
    totalCriteria++;
    if (profile.branch) {
      const userBranch = profile.branch.toLowerCase();
      branchMet = job.branch_required.some((b: string) => userBranch.includes(b.toLowerCase()) || b.toLowerCase().includes(userBranch));
      if (branchMet) {
        eligibleCount++;
      } else {
        reasons.push(`Branch ${profile.branch} not listed in required branches`);
      }
    } else {
      reasons.push(`Branch not set in profile`);
    }
  }

  // Determine overall status
  if (totalCriteria === 0) {
    return { status: 'eligible', reasons: ['Open to all candidates'], cgpaMet, batchMet, branchMet };
  }

  if (eligibleCount === totalCriteria) {
    return { status: 'eligible', reasons: ['All eligibility criteria met!'], cgpaMet, batchMet, branchMet };
  } else if (eligibleCount > 0) {
    return { status: 'partial', reasons, cgpaMet, batchMet, branchMet };
  } else {
    return { status: 'high_bar', reasons, cgpaMet, batchMet, branchMet };
  }
}
