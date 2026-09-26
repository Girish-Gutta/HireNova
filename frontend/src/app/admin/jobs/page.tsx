'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Clock, 
  Layers, 
  CheckCircle2, 
  X, 
  Tag, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchJobs, createJob, Job, InterviewPhaseConfig } from '@/lib/api';

const DEFAULT_PHASES: InterviewPhaseConfig[] = [
  { type: 'mcq', order: 1, durationMinutes: 10, weight: 0.15 },
  { type: 'coding', order: 2, durationMinutes: 30, weight: 0.35 },
  { type: 'speaking', order: 3, durationMinutes: 15, weight: 0.20 },
  { type: 'scenario', order: 4, durationMinutes: 15, weight: 0.30 },
];

export default function AdminJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [seniority, setSeniority] = useState('Mid');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js']);
  const [phases, setPhases] = useState<InterviewPhaseConfig[]>(DEFAULT_PHASES);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and Job Description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newJob = await createJob({
        title,
        department,
        seniority,
        description,
        requiredSkills: skills,
        phasesConfig: phases,
        companyName: user?.companyName || 'HireNova Partner',
      });

      setJobs([newJob, ...jobs]);
      setIsModalOpen(false);
      // Reset
      setTitle('');
      setDescription('');
      setSkills(['TypeScript', 'React', 'Node.js']);
    } catch (err: any) {
      setError(err.message || 'Failed to publish job posting');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.required_skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Job Postings & Autonomous Screening Config
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure job openings, technical requirements, and custom multi-phase interview plans
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setIsModalOpen(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Opening</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, department, or required skill tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Loading active openings...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">No job openings found</h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
            Create your first job posting to define the evaluation rubric and interview phases.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Job Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    {job.department}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {job.seniority}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {job.id.substring(0, 8)}...
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
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

              {/* Phases and Action */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                <div className="text-left md:text-right space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    {job.phases_config?.length || 4} AI Interview Rounds
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {job.phases_config?.map((p) => p.type.toUpperCase()).join(' → ')}
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active for Applications
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  Create New Job Opening
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define technical requirements and configure AI interview rounds
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-6 space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering, AI Labs"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Seniority */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Seniority Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['Junior', 'Mid', 'Senior', 'Lead', 'Staff'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeniority(level)}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        seniority === level
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Job Description & Scope (JD) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail responsibilities, tech stack, and what the candidate will build..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Skills Tag Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Required Skills & Technologies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                    placeholder="Type skill and press Add (e.g. Docker, Python, System Design)..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Configured Phases Overview */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Autonomous Multi-Phase Interview Sequence:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {phases.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
                        Round {p.order}: {p.type}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {p.durationMinutes}m • {Math.round(p.weight * 100)}% weight
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Publishing...' : 'Publish Job Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
