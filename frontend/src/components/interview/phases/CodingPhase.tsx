'use client';

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Code2, Terminal, ArrowRight, Loader2 } from 'lucide-react';
import { executeCode, type GeneratedQuestion } from '@/lib/api';

interface CodingPhaseProps {
  question: GeneratedQuestion;
  onComplete: (code: string, score: number, executionResult: any) => void;
  onAvatarStateChange?: (state: 'idle' | 'speaking' | 'listening' | 'warning', message?: string) => void;
}

const STARTER_CODES: Record<string, string> = {
  javascript: `/**
 * Solve the problem below.
 * Return the expected output.
 */
function solve(input) {
  // Your implementation here
  return input;
}

// Example execution:
console.log(solve("test"));`,
  typescript: `function solve(input: any): any {
  // Your implementation here
  return input;
}

console.log(solve("test"));`,
  python: `# Solve the problem below.
def solve(input_val):
    # Your implementation here
    return input_val

print(solve("test"))`,
};

export function CodingPhase({ question, onComplete, onAvatarStateChange }: CodingPhaseProps) {
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [sourceCode, setSourceCode] = useState<string>(STARTER_CODES.javascript);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('Run your code to see output here.');
  const [lastExecution, setLastExecution] = useState<{ success: boolean; output: string } | null>(null);

  const handleLanguageChange = (newLang: 'javascript' | 'typescript' | 'python') => {
    setLanguage(newLang);
    setSourceCode(STARTER_CODES[newLang] || STARTER_CODES.javascript);
    onAvatarStateChange?.('speaking', `Switched language to ${newLang.toUpperCase()}.`);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setTerminalOutput('Executing in sandbox environment...');
    onAvatarStateChange?.('listening', 'Running your solution against test cases in the execution sandbox...');

    try {
      const result = await executeCode(language, sourceCode);
      setIsRunning(false);
      setLastExecution(result);
      setTerminalOutput(result.output || result.stdout || 'Program exited with no output.');

      if (result.success) {
        onAvatarStateChange?.('speaking', 'Execution finished cleanly! Review the output and submit when ready.');
      } else {
        onAvatarStateChange?.('warning', 'The program produced errors or failed test execution. Check the terminal output.');
      }
    } catch (err: any) {
      setIsRunning(false);
      const errMsg = `Error: ${err.message}`;
      setTerminalOutput(errMsg);
      setLastExecution({ success: false, output: errMsg });
      onAvatarStateChange?.('warning', 'Execution failed. Check syntax and try again.');
    }
  };

  const handleSubmit = () => {
    const isSuccess = lastExecution?.success ?? false;
    const baseScore = isSuccess ? 90 : sourceCode.length > 50 ? 65 : 40;
    onComplete(sourceCode, baseScore, lastExecution);
  };

  return (
    <div className="space-y-6">
      {/* Problem Description Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-slate-100">Live Coding Challenge</h3>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['javascript', 'typescript', 'python'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  language === lang
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'javascript' ? 'JavaScript' : lang === 'typescript' ? 'TypeScript' : 'Python'}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
          {question.text || 'Write an efficient function to solve the problem requirements.'}
        </div>

        {/* Test Cases preview if present */}
        {question.testCases && question.testCases.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Sample Test Cases
            </span>
            <div className="space-y-2">
              {question.testCases
                .filter((tc) => !tc.isHidden)
                .map((tc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs font-mono"
                  >
                    <span className="text-slate-400">Input: <span className="text-emerald-400">{tc.input}</span></span>
                    <span className="text-slate-400">Expected: <span className="text-amber-400">{tc.expectedOutput}</span></span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <span>solution.{language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}</span>
          <span>UTF-8</span>
        </div>

        <textarea
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          spellCheck={false}
          className="w-full h-72 bg-slate-950 p-4 font-mono text-sm text-emerald-300 focus:outline-none resize-none leading-relaxed"
          placeholder="// Write your code here..."
        />
      </div>

      {/* Terminal Output */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Execution Terminal</span>
          </div>
          {lastExecution && (
            <span
              className={`flex items-center gap-1 ${
                lastExecution.success ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {lastExecution.success ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {lastExecution.success ? 'Passed' : 'Errors Detected'}
            </span>
          )}
        </div>

        <pre className="text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
          {terminalOutput}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleRunCode}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-slate-100 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 disabled:opacity-50"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
          Run Sandbox
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Submit Code Solution
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
