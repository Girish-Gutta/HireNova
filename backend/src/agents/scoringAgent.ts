import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import type { PhaseResult, ProctoringEvent, ScoreReport } from '../services/sessionStore.js';

const isGeminiAvailable = (): boolean =>
  Boolean(env.GEMINI_API_KEY && !env.GEMINI_API_KEY.includes('placeholder') && env.GEMINI_API_KEY.length > 10);

function computeHeuristicScore(phaseResults: PhaseResult[], proctoringEvents: ProctoringEvent[]): ScoreReport {
  let totalWeighted = 0;
  let totalWeight = 0;
  const phaseBreakdown: Record<string, number> = {};

  const weights: Record<string, number> = { mcq: 0.15, coding: 0.40, speaking: 0.20, scenario: 0.25 };

  for (const result of phaseResults) {
    const w = weights[result.phaseType] ?? 0.25;
    phaseBreakdown[result.phaseType] = result.weightedScore;
    totalWeighted += result.weightedScore * w;
    totalWeight += w;
  }

  const totalScore = totalWeight > 0 ? Math.round(totalWeighted / totalWeight) : 50;
  const highSeverityFlags = proctoringEvents.filter((e) => e.severity === 'high').length;
  const adjustedScore = Math.max(0, totalScore - highSeverityFlags * 3);

  let recommendation: ScoreReport['recommendation'];
  if (adjustedScore >= 80) recommendation = 'strong_hire';
  else if (adjustedScore >= 65) recommendation = 'hire';
  else if (adjustedScore >= 50) recommendation = 'maybe';
  else recommendation = 'no_hire';

  return {
    sessionId: phaseResults[0]?.sessionId ?? '',
    applicationId: '',
    totalScore: adjustedScore,
    phaseBreakdown,
    proctoringFlags: proctoringEvents.length,
    recommendation,
    strengths: ['Demonstrated problem-solving approach', 'Communication clarity'],
    improvements: ['Consider deeper system design exposure', 'Strengthen edge case handling'],
    summary: `Candidate completed the interview with an overall score of ${adjustedScore}/100. The AI recommends: ${recommendation.replace('_', ' ')}.`,
    generatedAt: new Date().toISOString(),
  };
}

export async function scoringAgent(params: {
  sessionId: string;
  applicationId: string;
  jobTitle: string;
  requiredSkills: string[];
  phaseResults: PhaseResult[];
  proctoringEvents: ProctoringEvent[];
}): Promise<ScoreReport> {
  const heuristicReport = computeHeuristicScore(params.phaseResults, params.proctoringEvents);
  heuristicReport.sessionId = params.sessionId;
  heuristicReport.applicationId = params.applicationId;

  if (!isGeminiAvailable() || params.phaseResults.length === 0) {
    return heuristicReport;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const resultsJson = JSON.stringify(params.phaseResults, null, 2);
    const proctoringJson = JSON.stringify(params.proctoringEvents, null, 2);

    const prompt = `You are the HireNova AI Scoring Agent.
Evaluate this candidate's interview performance for: ${params.jobTitle}
Required skills: ${params.requiredSkills.join(', ')}

PHASE RESULTS:
${resultsJson}

PROCTORING EVENTS (integrity flags):
${proctoringJson}

Compute a holistic evaluation. Return ONLY valid JSON with this exact schema:
{
  "totalScore": number (0-100),
  "phaseBreakdown": { "mcq": number, "coding": number, "speaking": number, "scenario": number },
  "proctoringFlags": number,
  "recommendation": "strong_hire" | "hire" | "maybe" | "no_hire",
  "strengths": string[] (3-4 items),
  "improvements": string[] (2-3 items),
  "summary": string (2-3 sentence paragraph)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { temperature: 0.1, responseMimeType: 'application/json' },
    });

    const text = response.text?.trim() || '';
    if (text) {
      const parsed = JSON.parse(text);
      return {
        sessionId: params.sessionId,
        applicationId: params.applicationId,
        generatedAt: new Date().toISOString(),
        ...parsed,
      };
    }
  } catch (err: any) {
    console.warn('[ScoringAgent] Gemini failed, using heuristic score:', err.message);
  }

  return heuristicReport;
}
