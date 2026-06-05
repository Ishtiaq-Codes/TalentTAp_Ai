export const API_BASE = '/api/v1'

export const ROLES = {
  ADMIN: 'admin',
  COMPANY_ADMIN: 'company_admin',
  RECRUITER: 'recruiter',
  CANDIDATE: 'candidate',
}

export const JOB_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
}

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  REVIEWING: 'reviewing',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
}

export const EMPLOYMENT_STATUS = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'freelancing', label: 'Freelancing' },
  { value: 'student', label: 'Student' },
]

export const AVAILABILITY = [
  { value: 'immediate', label: 'Immediate' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: '1_month', label: '1 Month' },
  { value: '3_months', label: '3 Months' },
  { value: 'not_available', label: 'Not Available' },
]

export const EMPLOYMENT_TYPE = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

export const REMOTE_STATUS = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const REMOTE_PREFERENCES = [
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
  { value: 'any', label: 'Any' },
]

export const COMPANY_SIZE = [
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '501-1000', label: '501-1000' },
  { value: '1000+', label: '1000+' },
]
