import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';
import { caseService, Case } from '../services/caseService';

export default function VerdictReport({ caseId }: { caseId: string | null }) {
  const [currentCase, setCurrentCase] = useState<Case | null>(null);

  useEffect(() => {
    if (caseId) {
      caseService.getCaseById(caseId).then(data => {
        if (data) setCurrentCase(data);
      });
    }
  }, [caseId]);

  const analysis = currentCase?.analysis;

  return (
    <div className="space-y-24 max-w-7xl mx-auto">
      {/* Hero Verdict */}
      <section className="space-y-16 py-12">
        <div className="flex items-center gap-6">
          <div className="h-px bg-primary/20 w-32" />
          <span className="text-sm font-black tracking-[0.6em] text-primary opacity-50 uppercase">Case ID: {currentCase?.ref || '#R-9924-AC'}</span>
        </div>
        
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-primary font-light leading-none tracking-tight -ml-2">
          Audit <span className="font-light italic text-primary/60 block lg:inline">Verdict</span>
        </h1>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 border-t border-primary/10 pt-12">
          <div className="space-y-6 max-w-4xl">
            <h2 className="font-serif text-4xl md:text-6xl text-primary font-light uppercase tracking-tight leading-none">
              {analysis?.case_analysis.overall_case_strength === 'strong' ? 'Strong Grounds for Appeal' :
               analysis?.case_analysis.overall_case_strength === 'moderate' ? 'Some Grounds for Appeal' :
               analysis?.case_analysis.overall_case_strength === 'weak' ? 'Limited Grounds for Appeal' : 'Analyzing Your Case'}
            </h2>
            <p className="text-2xl md:text-3xl text-primary/70 font-serif italic leading-relaxed font-medium">
              {analysis?.case_analysis.case_strength_reason || "Review the findings below to understand your options."}
            </p>
          </div>
          
          <div className="flex flex-col items-center xl:items-end gap-1 bg-primary/[0.03] p-10 rounded-[3rem] border border-primary/10">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/50 mb-2">Points Potential</div>
            <div className="flex items-baseline gap-3">
              <span className="text-7xl md:text-8xl font-serif font-light text-primary tracking-tight leading-none">
                +{(analysis?.case_analysis.potential_calculation_errors?.reduce((acc, curr) => acc + curr.discrepancy, 0) || 0) + (analysis?.case_analysis.unexplained_deductions?.reduce((acc, curr) => acc + curr.points_lost, 0) || 0) || '4.2'}
              </span>
              <span className="text-2xl font-serif font-light text-primary/50 italic">PTS</span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary opacity-40 mt-4">Estimated points recoverable</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-12">
          <button className="bg-primary text-white px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs hover:shadow-[0_20px_50px_rgba(0,35,111,0.3)] hover:-translate-y-2 transition-all flex items-center gap-6 group">
            Write Appeal Letter
            <ICONS.ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
          </button>
          <button className="bg-white border-2 border-primary/10 text-primary px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-primary/5 transition-all">
            Download Evidence
          </button>
        </div>
      </section>

      {/* Discovery Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Probability Meter (Bento) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-12 glass-panel rounded-[5rem] p-24 flex flex-col items-center text-center relative overflow-hidden bg-white border-2 border-primary/10 shadow-huge"
        >
          <div className="absolute inset-0 paper-texture opacity-10 pointer-events-none" />
          
          <div className="space-y-4 mb-20">
            <h3 className="text-sm font-black uppercase tracking-[0.8em] text-primary opacity-60">Case Strength</h3>
            <div className="h-px w-32 bg-primary/20 mx-auto" />
          </div>
          
          <div className="relative w-full max-w-5xl aspect-[2/1] flex flex-col items-center justify-center">
             <div className="flex items-baseline gap-6">
                <motion.span 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="font-serif text-8xl md:text-[12rem] font-light text-primary tracking-tight leading-none"
                >
                  {Math.round((analysis?.confidence.overall_confidence || 0.85) * 100)}
                </motion.span>
                <div className="flex flex-col items-start">
                  <span className="text-6xl md:text-8xl font-serif text-primary/20 font-light leading-none">%</span>
                </div>
             </div>
             <p className="text-2xl md:text-3xl font-serif italic text-primary/60 mt-4 font-light">Estimated chance of a successful appeal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full mt-24 pt-16 border-t border-primary/5">
             <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Rubric Alignment</p>
                <p className="text-5xl font-serif font-light text-primary tracking-tight">{Math.round((analysis?.case_analysis.rubric_alignment_score || 0.8) * 100)}%</p>
             </div>
             <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Deductions Found</p>
                <p className="text-5xl font-serif font-light text-primary tracking-tight">{analysis?.questions?.reduce((acc, q) => acc + (q.points_lost || 0), 0) || 4}</p>
             </div>
             <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Questions Reviewed</p>
                <p className="text-5xl font-serif font-light text-primary tracking-tight">{analysis?.questions?.length || 12}</p>
             </div>
          </div>
        </motion.div>

        {/* Intelligence Table */}
        <motion.div className="lg:col-span-7 space-y-8">
           <div className="flex items-center gap-4 mb-2">
              <h3 className="font-serif text-3xl text-primary font-light">Critical Findings</h3>
              <div className="h-px flex-1 bg-primary/10" />
           </div>
           
           <div className="space-y-6">
             {analysis?.case_analysis.unexplained_deductions?.map((finding, i) => (
               <div key={i} className="glass-panel p-8 rounded-[2rem] hover:bg-white transition-all group cursor-pointer border-primary/5">
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                     <div className="p-3 bg-red-500/5 rounded-xl text-red-500/40 group-hover:text-red-500 transition-colors">
                        <ICONS.ShieldAlert size={20} />
                     </div>
                     <div>
                       <h4 className="font-serif text-xl text-primary font-medium">{finding.question_id}</h4>
                       <p className="text-[10px] font-mono opacity-40 uppercase tracking-tighter">Deduction: -{finding.points_lost} pts</p>
                     </div>
                   </div>
                   <span className="text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-primary/5 text-primary/60">Missing Feedback</span>
                 </div>
                 <p className="text-sm text-on-surface-variant font-serif italic leading-relaxed mb-6 opacity-80">{finding.what_is_missing}</p>
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 group-hover:text-primary transition-all">
                    <span>View Details</span>
                    <ICONS.ArrowRight size={14} className="group-hover:translate-x-1" />
                 </div>
               </div>
             ))}

             {analysis?.case_analysis.strongest_appeal_points?.slice(0, 2).map((point, i) => (
                <div key={`appeal-${i}`} className="glass-panel p-8 rounded-[2rem] hover:bg-white transition-all group cursor-pointer border-primary/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/5 rounded-xl text-primary/40 group-hover:text-primary transition-colors">
                         <ICONS.TrendingUp size={20} />
                      </div>
                      <div>
                        <h4 className="font-serif text-xl text-primary font-medium">Strategic Leverage</h4>
                        <p className="text-[10px] font-mono opacity-40 uppercase tracking-tighter">Appeal Angle {i+1}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-secondary/10 text-secondary">Verified Strength</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-serif italic leading-relaxed mb-6 opacity-80">{point}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 group-hover:text-primary transition-all">
                     <span>Use This Point</span>
                     <ICONS.ArrowRight size={14} className="group-hover:translate-x-1" />
                  </div>
                </div>
             ))}
           </div>
        </motion.div>
      </div>

      {/* Teacher Profile Section */}
      <section className="bg-[#001438] rounded-[3rem] p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 paper-texture opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5 space-y-10">
            <h3 className="font-serif text-4xl font-light tracking-tight">Grading Pattern Analysis</h3>
            <p className="text-white/50 text-lg font-serif italic max-w-sm leading-relaxed">
              Synthesized grading methodology based on feedback patterns and rubric adherence.
            </p>
            <div className="space-y-6 pt-10 border-t border-white/10">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
                 <span>Grading Style: {analysis?.teacher_profile.grading_style || 'Moderate'}</span>
                 <span className="text-white">Consistency: {analysis?.teacher_profile.uses_rubric_consistently ? 'High' : 'Low'}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: analysis?.teacher_profile.uses_rubric_consistently ? '90%' : '30%' }} transition={{ delay: 1, duration: 1.5 }} className="h-full bg-white shadow-[0_0_20px_white]" />
              </div>
            </div>
            {analysis?.teacher_profile.grading_style_evidence && (
              <p className="text-[10px] text-white/40 font-mono leading-relaxed bg-white/5 p-4 rounded-xl italic">
                "{analysis.teacher_profile.grading_style_evidence}"
              </p>
            )}
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-2 gap-12 sm:gap-20">
             {[
               { label: 'Philosophy', val: analysis?.teacher_profile.marking_philosophy || 'Standards', sub: 'Primary Driver' },
               { label: 'Feedback Quality', val: analysis?.teacher_profile.feedback_quality || 'Adequate', sub: 'Tone Analysis' },
               { label: 'Deductions', val: analysis?.teacher_profile.deduction_pattern || 'Aligned', sub: 'Pattern Type' },
               { label: 'Score Ceiling', val: analysis?.teacher_profile.typical_ceiling_estimate ? `${analysis.teacher_profile.typical_ceiling_estimate}%` : '90%', sub: 'Realistic Max' }
             ].map((stat, i) => (
               <div key={i} className="space-y-2 group">
                 <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 group-hover:text-white/60 transition-colors">{stat.label}</p>
                 <p className="font-serif text-3xl md:text-4xl font-light tracking-tighter truncate uppercase">{stat.val}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">{stat.sub}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Institutional Timeline */}
      <section className="pb-32 px-6">
         <div className="flex items-center gap-4 mb-20">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary/40">Case Resolution Roadmap</h4>
            <div className="h-px flex-1 bg-primary/5" />
         </div>
         
         <div className="relative border-l border-primary/10 ml-8 pl-16 space-y-24 max-w-3xl">
            {[
              { status: 'DONE', color: 'bg-primary', title: 'Analysis Complete', desc: 'Regrade has reviewed your grade, rubric, and feedback for inconsistencies.' },
              { status: 'NEXT', color: 'bg-primary animate-pulse', title: 'Write Your Appeal', desc: 'Use the findings above to draft a clear, professional appeal letter.' },
              { status: 'PENDING', color: 'bg-primary/5', title: 'Submit to Professor', desc: 'Send your appeal to your professor or the department\'s review committee.' },
            ].map((s, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -left-[76px] top-1.5 w-5 h-5 rounded-lg border-2 border-surface shadow-sm ${s.color}`} />
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4 text-primary opacity-40">{s.status}</p>
                <div className="space-y-3">
                  <p className="font-serif text-4xl text-primary font-light">{s.title}</p>
                  <p className="text-lg text-on-surface-variant font-serif italic opacity-60 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
