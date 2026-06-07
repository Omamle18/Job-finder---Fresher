import React, { useState } from "react";
import { User, BookOpen, Layers, Target, Save, Check } from "lucide-react";
import { CandidateProfile } from "../types";

interface FresherProfileFormProps {
  profile: CandidateProfile;
  onProfileSave: (profile: CandidateProfile) => void;
}

export default function FresherProfileForm({ profile, onProfileSave }: FresherProfileFormProps) {
  const [formData, setFormData] = useState<CandidateProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 px-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Fresher Candidate Profile</h3>
            <p className="text-[10px] text-slate-500 font-medium">Used to personalize your recruiter cover letters / cold email pitch</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-800">
        {/* Candidate Name */}
        <div>
          <label className="block text-slate-600 text-xs font-semibold mb-1.5">Candidate Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Rohan Sharma"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Target Job Role */}
        <div>
          <label className="block text-slate-600 text-xs font-semibold mb-1.5">Target Job / Role Preference</label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              placeholder="e.g., Associate Frontend Dev, QA Trainee, Data Analyst"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Education background */}
        <div>
          <label className="block text-slate-600 text-xs font-semibold mb-1.5">Education / College Degree</label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="e.g., B.Tech in CSE (GPA: 8.2), VIT Vellore"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Year of graduation */}
        <div>
          <label className="block text-slate-600 text-xs font-semibold mb-1.5">Graduation Year</label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.graduationYear}
              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              placeholder="e.g., 2025 (Graduate) or 2026 (Final Year)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Skills list input */}
      <div>
        <label className="block text-slate-600 text-xs font-semibold mb-1.5 font-sans">Core Technical & Soft Skills</label>
        <textarea
          required
          rows={2}
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          placeholder="e.g., JavaScript, React.js, Express, Python, SQL databases, Git, Data Structures & Algorithms (DSA)"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 resize-none"
        />
      </div>

      {/* Projects context */}
      <div>
        <label className="block text-slate-600 text-xs font-semibold mb-1.5 font-sans">Key Projects / Trainee Internships</label>
        <textarea
          rows={2}
          value={formData.projects}
          onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
          placeholder="e.g., 1. E-Commerce Backend (built with node, postgre, docker) 2. Personal portfolio with dark slate aesthetics"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 resize-none"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          className={`flex items-center space-x-1 px-4 py-2 text-xs font-bold rounded-lg shadow-md transition-all ${
            isSaved 
              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
          }`}
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Profile Baseline</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
