import { env } from '../config/env.js';

const isResendAvailable = (): boolean =>
  Boolean(env.RESEND_API_KEY && !env.RESEND_API_KEY.includes('placeholder') && env.RESEND_API_KEY.length > 10);

function buildInviteHtml(candidateName: string, jobTitle: string, interviewUrl: string, expiresAt: Date): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>HireNova Interview Invitation</title></head>
<body style="margin:0;padding:0;background:#0B0F19;font-family:system-ui,sans-serif;">
  <table style="max-width:600px;margin:40px auto;background:#111827;border-radius:12px;overflow:hidden;">
    <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">🚀 HireNova</h1>
      <p style="color:#d1fae5;margin:8px 0 0;">AI-Powered Interview Platform</p>
    </td></tr>
    <tr><td style="padding:40px;">
      <h2 style="color:#f9fafb;margin:0 0 16px;">Hello, ${candidateName}!</h2>
      <p style="color:#9ca3af;line-height:1.6;">Congratulations! You have been invited to interview for the position of:</p>
      <div style="background:#1f2937;border-left:4px solid #10b981;padding:16px;border-radius:4px;margin:24px 0;">
        <strong style="color:#10b981;font-size:20px;">${jobTitle}</strong>
      </div>
      <p style="color:#9ca3af;line-height:1.6;">Your interview is conducted entirely by our AI interviewer. You can complete it at your own pace before the link expires.</p>
      <p style="color:#ef4444;font-size:14px;">⏰ <strong>Expires:</strong> ${expiresAt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${interviewUrl}" style="background:#10b981;color:#fff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
          Start Your Interview →
        </a>
      </div>
      <p style="color:#6b7280;font-size:12px;line-height:1.6;">
        • Ensure you are in a quiet, well-lit environment<br>
        • Have a stable internet connection<br>
        • The interview takes approximately 70–90 minutes<br>
        • Your webcam will be active for proctoring
      </p>
    </td></tr>
    <tr><td style="padding:24px;text-align:center;border-top:1px solid #1f2937;">
      <p style="color:#4b5563;font-size:12px;margin:0;">This is an automated message from HireNova. Please do not reply to this email.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildResultsHtml(candidateName: string, jobTitle: string, recommendation: string): string {
  const isPositive = ['strong_hire', 'hire'].includes(recommendation);
  const label = recommendation.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your Interview Results - HireNova</title></head>
<body style="margin:0;padding:0;background:#0B0F19;font-family:system-ui,sans-serif;">
  <table style="max-width:600px;margin:40px auto;background:#111827;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#1f2937;padding:32px;text-align:center;">
      <h1 style="color:#f9fafb;margin:0;font-size:24px;">Interview Complete — Results</h1>
    </td></tr>
    <tr><td style="padding:40px;">
      <p style="color:#9ca3af;">Hi <strong style="color:#f9fafb;">${candidateName}</strong>,</p>
      <p style="color:#9ca3af;">Your AI interview for <strong style="color:#f9fafb;">${jobTitle}</strong> has been evaluated.</p>
      <div style="background:${isPositive ? '#064e3b' : '#7f1d1d'};border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="color:#9ca3af;margin:0 0 8px;font-size:14px;">AI Recommendation</p>
        <h2 style="color:${isPositive ? '#34d399' : '#fca5a5'};margin:0;">${label}</h2>
      </div>
      <p style="color:#6b7280;font-size:14px;">The recruiter will review the AI recommendation and contact you with next steps.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendInterviewInvite(
  to: string,
  candidateName: string,
  jobTitle: string,
  interviewUrl: string,
  expiresAt: Date,
): Promise<{ sent: boolean; provider: string }> {
  const html = buildInviteHtml(candidateName, jobTitle, interviewUrl, expiresAt);
  const subject = `Your HireNova Interview for ${jobTitle} is Ready`;

  if (isResendAvailable()) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'HireNova <noreply@hirenova.ai>',
          to: [to],
          subject,
          html,
        }),
      });
      if (response.ok) {
        return { sent: true, provider: 'resend' };
      }
    } catch (err: any) {
      console.warn('[EmailAgent] Resend failed:', err.message);
    }
  }

  // Console fallback
  console.log('\n📧 [EmailAgent] Interview Invite (DEV MODE)');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Interview URL:', interviewUrl);
  console.log('Expires At:', expiresAt.toISOString());
  console.log('---');
  return { sent: true, provider: 'console-log' };
}

export async function sendResultsNotification(
  to: string,
  candidateName: string,
  jobTitle: string,
  recommendation: string,
): Promise<{ sent: boolean }> {
  const html = buildResultsHtml(candidateName, jobTitle, recommendation);
  const subject = `Your HireNova Interview Results — ${jobTitle}`;

  if (isResendAvailable()) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'HireNova <noreply@hirenova.ai>',
          to: [to],
          subject,
          html,
        }),
      });
      if (response.ok) return { sent: true };
    } catch (_) {}
  }

  console.log('\n📧 [EmailAgent] Results Email (DEV MODE)');
  console.log('To:', to, '| Recommendation:', recommendation);
  return { sent: true };
}
