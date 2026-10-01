import { sessionStore } from '../services/sessionStore.js';
import { dbStore } from '../services/dbStore.js';
import { sendInterviewInvite } from './emailAgent.js';
import { env } from '../config/env.js';

export async function createInterviewSession(params: {
  applicationId: string;
  expiryHours?: number;
}): Promise<{ session: any; interviewUrl: string }> {
  // Fetch application details
  const allApps = await dbStore.getAllApplications();
  const application = allApps.find((a) => a.id === params.applicationId);
  if (!application) throw new Error('Application not found');

  const job = await dbStore.getJobById(application.job_id);
  if (!job) throw new Error('Job not found for application');

  const session = await sessionStore.createSession({
    applicationId: params.applicationId,
    jobId: application.job_id,
    candidateId: application.candidate_id,
    candidateEmail: application.candidate_email || 'candidate@hirenova.local',
    candidateName: application.candidate_name || 'Candidate',
    jobTitle: job.title,
    expiryHours: params.expiryHours ?? 72,
  });

  const baseUrl = env.FRONTEND_URL || 'http://localhost:3000';
  const interviewUrl = `${baseUrl}/interview/${session.linkToken}`;

  // Update application status
  await dbStore.updateApplication(params.applicationId, { status: 'interview_scheduled' });

  // Fire email (non-blocking)
  sendInterviewInvite(
    session.candidateEmail,
    session.candidateName,
    session.jobTitle,
    interviewUrl,
    session.expiresAt,
  ).catch((err) => console.warn('[SchedulingAgent] Email send warning:', err.message));

  return { session, interviewUrl };
}
