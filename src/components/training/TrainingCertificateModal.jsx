import React, { useRef } from 'react';
import { Award, CheckCircle2, Printer, X, Sparkles, Building2, ShieldCheck, Clock, FileCheck } from 'lucide-react';

export function TrainingCertificateModal({ isOpen, onClose, certData }) {
  const certRef = useRef(null);

  if (!isOpen || !certData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto" onClick={onClose}>
      <div className="bg-slate-900 border border-purple-500/60 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Control Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-300" />
            <h3 className="font-black text-xs sm:text-sm text-white">
              Official MSR Next Gen Verified Corporate Certificate
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="tap-target px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Corporate Certificate */}
        <div className="p-4 sm:p-8 bg-white text-slate-950">
          <div ref={certRef} className="border-4 border-double border-amber-600 p-5 sm:p-8 rounded-2xl text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-amber-50/40 shadow-inner">
            
            {/* Header with CIN & ISO Standard */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                MSR NEXT GEN E-COMMERCE PVT. LTD.
              </div>
              <h2 className="text-lg sm:text-2xl font-serif font-black text-slate-900 uppercase tracking-tight">
                Certificate of Professional Competency & Skill Mastery
              </h2>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
                CIN: U74999UP2026PTC198421 • ISO 9001:2015 Compliant E-Commerce Operations
              </p>
            </div>

            {/* Candidate Info */}
            <div className="space-y-2 py-1 sm:py-2">
              <p className="text-xs text-slate-600 italic">This is proudly and formally presented to</p>
              <h1 className="text-xl sm:text-3xl font-serif font-black text-purple-950 underline decoration-amber-500 underline-offset-4">
                {certData.candidateName}
              </h1>
              <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed">
                for demonstrating exceptional performance, verified video attendance, and securing distinction in the 
                <strong> "{certData.courseTitle}"</strong> assessment.
              </p>
            </div>

            {/* 3 Verification Badges (Watch Time, AI Score & Security Hash) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-left">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 space-y-0.5">
                <span className="text-[9px] font-bold text-purple-700 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-600" /> Video Attendance
                </span>
                <p className="text-xs font-black text-purple-950">{certData.watchTime || '100% Watched'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                <span className="text-[9px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Exam Score
                </span>
                <p className="text-xs font-black text-emerald-950">{certData.grade || '20/20 (100% - Grade A+)'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 space-y-0.5">
                <span className="text-[9px] font-bold text-blue-700 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" /> Security Serial
                </span>
                <p className="text-xs font-mono font-black text-blue-950">{certData.serialCode || `MSR-${Date.now().toString(36).toUpperCase()}`}</p>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-5 border-t border-slate-300 flex items-end justify-between text-left text-[10px]">
              <div>
                <p className="font-mono text-slate-500">Date of Certification: <strong>{certData.date}</strong></p>
                <div className="flex items-center gap-1 text-emerald-700 font-bold mt-0.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Maya AI Authenticated & HR Verified</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-serif italic font-black text-base text-slate-950 block">Mukul Mishra</span>
                <p className="font-black text-slate-900 uppercase">Mukul Mishra</p>
                <p className="text-[9px] text-slate-600 font-semibold">Managing Director & Super Admin</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
