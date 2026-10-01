import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import type { GeneratedQuestion } from '../services/sessionStore.js';

const FALLBACK_QUESTIONS: Record<string, GeneratedQuestion[]> = {
  mcq: [
    { id: 'mcq-1', type: 'mcq', text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 'O(log n)', timeLimit: 60 },
    { id: 'mcq-2', type: 'mcq', text: 'Which HTTP method is idempotent by definition?', options: ['POST', 'PATCH', 'PUT', 'DELETE'], correctAnswer: 'PUT', timeLimit: 60 },
    { id: 'mcq-3', type: 'mcq', text: 'In a REST API, which status code indicates a resource was successfully created?', options: ['200', '201', '204', '301'], correctAnswer: '201', timeLimit: 60 },
    { id: 'mcq-4', type: 'mcq', text: 'What does SOLID stand for in software engineering?', options: ['A design pattern set', 'Five object-oriented design principles', 'A database schema standard', 'A testing framework'], correctAnswer: 'Five object-oriented design principles', timeLimit: 60 },
    { id: 'mcq-5', type: 'mcq', text: 'Which data structure uses LIFO (Last In, First Out) order?', options: ['Queue', 'Stack', 'Heap', 'Linked List'], correctAnswer: 'Stack', timeLimit: 60 },
  ],
  coding: [
    { id: 'code-1', type: 'coding', text: 'Write a function that takes an array of integers and returns the two numbers that sum to a target value.\n\nExample: twoSum([2, 7, 11, 15], 9) → [0, 1]\n\nOptimize for O(n) time complexity.', testCases: [{ input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', isHidden: false }, { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', isHidden: true }], timeLimit: 1800 },
    { id: 'code-2', type: 'coding', text: 'Implement a function that checks whether a given string is a valid palindrome, ignoring non-alphanumeric characters and case.\n\nExample: isPalindrome("A man, a plan, a canal: Panama") → true', testCases: [{ input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false }, { input: '"race a car"', expectedOutput: 'false', isHidden: true }], timeLimit: 1800 },
  ],
  speaking: [
    { id: 'speak-1', type: 'speaking', text: 'Tell me about a technically challenging project you worked on. What was the problem, what decisions did you make, and what was the outcome?', scoringRubric: 'Clarity, technical depth, structured communication, learning mindset', timeLimit: 180 },
    { id: 'speak-2', type: 'speaking', text: 'How do you approach debugging a critical production issue at 2 AM with limited information? Walk me through your process.', scoringRubric: 'Systematic thinking, calmness under pressure, communication, incident response process', timeLimit: 180 },
    { id: 'speak-3', type: 'speaking', text: 'Describe a time you disagreed with a technical decision. How did you handle it?', scoringRubric: 'Professionalism, technical reasoning, collaboration, outcome orientation', timeLimit: 180 },
  ],
  scenario: [
    { id: 'scene-1', type: 'scenario', text: 'Your team has just deployed a new microservice to production. Within 30 minutes, error rates spike to 40% and latency triples. The previous deployment was 3 days ago and was stable. You have access to logs, metrics, and can roll back. What are your immediate next steps and how do you communicate with stakeholders?', scoringRubric: 'Structured incident response, prioritization, root cause analysis approach, communication clarity, rollback decision criteria', timeLimit: 900 },
    { id: 'scene-2', type: 'scenario', text: 'You are tasked with designing a URL shortener service that needs to handle 1 billion URLs and 100,000 requests per second at peak. Walk through your architecture, database choices, and trade-offs.', scoringRubric: 'System design thinking, scalability awareness, database knowledge, trade-off articulation', timeLimit: 900 },
  ],
};

interface QuestionGenInput {
  phaseType: 'mcq' | 'coding' | 'speaking' | 'scenario';
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  seniority: string;
  focusAreas: string[];
  difficulty: string;
  questionCount: number;
}

const isGeminiAvailable = (): boolean =>
  Boolean(env.GEMINI_API_KEY && !env.GEMINI_API_KEY.includes('placeholder') && env.GEMINI_API_KEY.length > 10);

export async function generateInterviewQuestions(input: QuestionGenInput): Promise<GeneratedQuestion[]> {
  const fallback = FALLBACK_QUESTIONS[input.phaseType] ?? FALLBACK_QUESTIONS.mcq;

  if (!isGeminiAvailable()) {
    return fallback.slice(0, input.questionCount);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const typeInstructions: Record<string, string> = {
      mcq: 'Multiple choice questions. Each has "text", "options" (array of 4 strings), "correctAnswer" (one of the options), "timeLimit" (seconds, 60-120).',
      coding: 'Coding challenges. Each has "text" (problem statement with examples), "testCases" (array with input, expectedOutput, isHidden), "timeLimit" (seconds, 1200-2400).',
      speaking: 'Open-ended verbal questions. Each has "text" (the question), "scoringRubric" (what to evaluate), "timeLimit" (seconds, 120-240).',
      scenario: 'Situational/behavioral questions. Each has "text" (scenario description), "scoringRubric", "timeLimit" (seconds, 600-1200).',
    };

    const prompt = `You are the HireNova Question Generation Agent.
Generate exactly ${input.questionCount} interview questions for the following role:

JOB TITLE: ${input.jobTitle}
SENIORITY: ${input.seniority}
REQUIRED SKILLS: ${input.requiredSkills.join(', ')}
FOCUS AREAS: ${input.focusAreas.join(', ')}
DIFFICULTY: ${input.difficulty}
PHASE TYPE: ${input.phaseType.toUpperCase()}

Question format: ${typeInstructions[input.phaseType]}

Each question must have an "id" (string, e.g. "${input.phaseType}-1"), "type": "${input.phaseType}".

Return ONLY a valid JSON array of exactly ${input.questionCount} question objects. No markdown, no explanation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    if (text) {
      const parsed = JSON.parse(text) as GeneratedQuestion[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err: any) {
    console.warn('[QuestionGenerator] Gemini failed, using fallback:', err.message);
  }

  return fallback.slice(0, input.questionCount);
}
