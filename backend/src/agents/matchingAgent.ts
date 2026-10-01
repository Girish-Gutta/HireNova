import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

export interface MatchingInput {
  resumeText: string;
  jobDescription: string;
  requiredSkills: string[];
  seniority: string;
  jobTitle: string;
}

export interface SuggestedPhasePlan {
  type: 'mcq' | 'coding' | 'speaking' | 'listening' | 'scenario';
  order: number;
  durationMinutes: number;
  weight: number;
  focusTip: string;
}

export interface MatchingResult {
  matchScore: number; // 0 - 100
  matchedSkills: string[];
  skillGaps: string[];
  rationale: string;
  confidenceScore: number; // 0.0 - 1.0
  suggestedPlan: {
    recommendedDifficulty: 'Junior' | 'Mid' | 'Senior' | 'Lead';
    focusAreas: string[];
    phases: SuggestedPhasePlan[];
  };
}

/**
 * Deterministic heuristic matcher (offline fallback and baseline evaluator)
 */
function heuristicMatch(input: MatchingInput): MatchingResult {
  const resumeLower = input.resumeText.toLowerCase();
  const jdLower = input.jobDescription.toLowerCase();

  const matchedSkills: string[] = [];
  const skillGaps: string[] = [];

  const allTargetSkills = Array.from(new Set([
    ...input.requiredSkills,
    // Extract common tech words if present in JD
    ...['typescript', 'javascript', 'python', 'node.js', 'react', 'next.js', 'postgresql', 'sql', 'docker', 'system design']
      .filter((tech) => jdLower.includes(tech))
  ]));

  for (const skill of allTargetSkills) {
    const sLower = skill.toLowerCase();
    const aliasMap: Record<string, string[]> = {
      'typescript': ['typescript', 'ts'],
      'javascript': ['javascript', 'js'],
      'node.js': ['node.js', 'node', 'nodejs'],
      'react': ['react', 'react.js', 'reactjs'],
      'next.js': ['next.js', 'nextjs', 'next'],
      'postgresql': ['postgresql', 'postgres', 'psql'],
      'docker': ['docker', 'containerization', 'containers'],
      'system design': ['system design', 'architecture', 'distributed systems'],
    };

    const searchTokens = aliasMap[sLower] || [sLower];
    const isMatched = searchTokens.some((token) => resumeLower.includes(token));

    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      skillGaps.push(skill);
    }
  }

  const total = matchedSkills.length + skillGaps.length;
  const ratio = total > 0 ? matchedSkills.length / total : 0.75;
  const baseScore = Math.round(ratio * 100);
  // Clamp between 40 and 95
  const matchScore = Math.max(45, Math.min(95, baseScore));

  const focusAreas = skillGaps.length > 0 ? skillGaps.slice(0, 3) : ['Core Problem Solving', 'System Design'];

  const phases: SuggestedPhasePlan[] = [
    {
      type: 'mcq',
      order: 1,
      durationMinutes: 10,
      weight: 0.15,
      focusTip: `Assess foundational concepts in ${matchedSkills.slice(0, 2).join(' & ')}`,
    },
    {
      type: 'coding',
      order: 2,
      durationMinutes: 30,
      weight: 0.40,
      focusTip: `Live implementation challenge with hidden test cases`,
    },
    {
      type: 'speaking',
      order: 3,
      durationMinutes: 15,
      weight: 0.20,
      focusTip: `Evaluate communication clarity on past architectural decisions`,
    },
    {
      type: 'scenario',
      order: 4,
      durationMinutes: 15,
      weight: 0.25,
      focusTip: `Situational inquiry targeting gap areas: ${focusAreas.join(', ')}`,
    },
  ];

  return {
    matchScore,
    matchedSkills,
    skillGaps,
    rationale: `Candidate demonstrates solid alignment in ${matchedSkills.length} core technical requirements (${matchedSkills.slice(0, 3).join(', ')}). Identified growth or verification areas in: ${skillGaps.slice(0, 2).join(', ') || 'None noted'}.`,
    confidenceScore: 0.88,
    suggestedPlan: {
      recommendedDifficulty: (['Junior', 'Mid', 'Senior', 'Lead'].includes(input.seniority)
        ? input.seniority
        : 'Mid') as any,
      focusAreas,
      phases,
    },
  };
}

/**
 * Match a Candidate Resume to a Job Description using Gemini API (with heuristic fallback)
 */
export async function matchResumeToJD(input: MatchingInput): Promise<MatchingResult> {
  const isGeminiAvailable = Boolean(
    env.GEMINI_API_KEY &&
    !env.GEMINI_API_KEY.includes('placeholder') &&
    env.GEMINI_API_KEY.length > 10
  );

  if (!isGeminiAvailable) {
    return heuristicMatch(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const systemPrompt = `You are the HireNova Autonomous Resume/JD Matching Agent.
Analyze the candidate's resume text against the employer's Job Description (JD).
Your job:
1. Extract candidate technical skills, years of experience, and domain alignment.
2. Determine matched skills and critical skill gaps against the JD requirements.
3. Compute an objective match score (0 to 100).
4. Recommend a tailored interview plan: phase weighting, duration, and specific focus areas.

Output ONLY valid JSON adhering to this exact schema:
{
  "matchScore": number (0-100),
  "matchedSkills": string[],
  "skillGaps": string[],
  "rationale": string (2-3 sentences justifying the score),
  "confidenceScore": number (0.0-1.0),
  "suggestedPlan": {
    "recommendedDifficulty": "Junior" | "Mid" | "Senior" | "Lead",
    "focusAreas": string[],
    "phases": [
      {
        "type": "mcq" | "coding" | "speaking" | "scenario",
        "order": number,
        "durationMinutes": number,
        "weight": number,
        "focusTip": string
      }
    ]
  }
}`;

    const prompt = `JOB TITLE: ${input.jobTitle}
SENIORITY: ${input.seniority}
REQUIRED SKILLS: ${input.requiredSkills.join(', ')}

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE RESUME CONTENT:
${input.resumeText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    if (text) {
      const parsed = JSON.parse(text) as MatchingResult;
      // Sanity validate output fields
      if (typeof parsed.matchScore === 'number' && Array.isArray(parsed.matchedSkills)) {
        return parsed;
      }
    }

    return heuristicMatch(input);
  } catch (err: any) {
    console.warn(`[MatchingAgent] Gemini inference encountered an issue, falling back to heuristic engine:`, err.message);
    return heuristicMatch(input);
  }
}
