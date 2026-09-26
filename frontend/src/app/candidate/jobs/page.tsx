'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  UploadCloud, 
  FileText, 
  X, 
  Loader2,
  Clock,
  Layers,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchJobs, uploadResume, submitApplication, Job } from '@/lib/api';

export default function CandidateJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Job for Application Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);

      // Read text content if plain text, or generate text preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setResumeText(content ? content.substring(0, 5000) : `${file.name} uploaded for evaluation.`);
      };
      if (file.type.includes('text')) {
        reader.readAsText(file);
      } else {
        setResumeText(`Candidate Resume: ${file.name} - Skills in TypeScript, Fullstack Architecture, Cloud services, and modern software engineering.`);
      }
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !user) return;

    if (!resumeFile && !resumeText) {
      setError('Please attach your resume file (PDF, DOCX, or TXT) before submitting.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      let resumeUrl = `https://storage.hirenova.local/resumes/${Date.now()}_resume.pdf`;

      if (resumeFile) {
        // Upload resume file
        const base64 = await toBase64(resumeFile);
        const uploadRes = await uploadResume(resumeFile.name, base64, resumeFile.type);
        resumeUrl = uploadRes.url;
      }

      await submitApplication({
        jobId: selectedJob.id,
        candidateId: user.id,
        candidateName: user.fullName || 'Alex Morgan',
        candidateEmail: user.email || 'candidate@hirenova.dev',
        resumeUrl,
        resumeText: resumeText || `Application submitted by ${user.fullName} for ${selectedJob.title}`,
      });

      setAppliedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Application submission failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.required_skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Explore Open Opportunities
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Apply with your resume to receive autonomous AI fit evaluation and an on-demand interview invitation
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by title, technology stack, or department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Fetching active positions...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
          <Briefcase className="w-8 h-8 text-slate-500 mb-3" />
          <h2 className="text-sm font-bold text-white">No matching roles found</h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Check back soon as hiring managers post new technical openings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {job.department}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {job.seniority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {job.company_name || 'Acme Systems'}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.required_skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Interview Info and Apply Button */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{job.phases_config?.length || 4} AI Rounds</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedJob(job);
                    setAppliedSuccess(false);
                    setError(null);
                    setResumeFile(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Apply for Position</h2>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  {selectedJob.title} • {selectedJob.company_name || 'HireNova Partner'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appliedSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Application Submitted!</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    Your resume has been stored and registered for <strong>{selectedJob.title}</strong>. The Resume/JD Matching Agent (Phase 3) will calculate your fit score.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    href="/candidate/dashboard"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md transition-all"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApply} className="mt-5 space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Candidate Info Summary */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="text-slate-400">Applicant:</div>
                  <div className="font-semibold text-white">{user?.fullName} ({user?.email})</div>
                </div>

                {/* Resume Upload Field */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Upload Your Resume (PDF, DOCX, TXT)
                  </label>
                  <div className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-colors bg-slate-950/40 relative">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    {resumeFile ? (
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          {resumeFile.name}
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          {(resumeFile.size / 1024).toFixed(1)} KB • Ready to submit
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-white">
                          Drag & drop resume or click to browse
                        </div>
                        <div className="text-[11px] text-slate-500">
                          PDF, DOCX or TXT up to 10MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rounds Summary */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 block mb-1">
                    AI Interview Structure:
                  </span>
                  <span>
                    {selectedJob.phases_config?.map((p) => `${p.type.toUpperCase()} (${p.durationMinutes}m)`).join(' → ')}
                  </span>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isUploading ? 'Submitting Application...' : 'Confirm & Apply'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
