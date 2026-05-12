import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';
import { auth } from '../lib/firebase';
import { caseService, Case } from '../services/caseService';

export default function Dashboard({ onStartAppeal }: { onStartAppeal: () => void }) {
  const user = auth.currentUser;
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Member';
  const [latestCase, setLatestCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const cases = await caseService.getUserCases();
        if (cases.length > 0) {
          setLatestCase(cases[0]);
        }
      } catch (err) {
        console.error("Failed to load appeal records:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  return (
    <div className="space-y-32 max-w-7xl mx-auto py-12">
      <section className="relative text-left">
        <div className="max-w-4xl mb-20 space-y-10">
          <div className="flex items-center gap-6">
            <div className="h-px bg-primary/20 w-12" />
            <span className="text-xs font-black tracking-[0.6em] text-primary opacity-40 uppercase">Your Dashboard</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-primary font-light leading-[1.1] tracking-tight -ml-2"
          >
            Welcome, <span className="font-light italic text-primary/60">{firstName}</span>.
          </motion.h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-on-surface-variant font-medium text-xl md:text-2xl opacity-80">
            <div className="flex items-center gap-4 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-green-700">Signed In</span>
            </div>
            <p className="leading-relaxed font-serif max-w-xl text-primary/70">
              Ready to help you build a clear, professional grade appeal.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartAppeal}
          className="w-full bg-primary text-white p-10 md:p-14 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row items-center justify-between gap-10 group relative overflow-hidden transition-all border border-white/10"
        >
          <div className="absolute inset-0 paper-texture opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />

          <div className="flex items-center gap-10 relative z-10 text-left">
            <div className="p-6 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-xl shadow-xl group-hover:scale-110 transition-transform">
              <ICONS.Plus size={48} strokeWidth={2} className="text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight leading-tight">Start New Appeal</h2>
              <p className="text-white/60 font-serif italic text-lg md:text-xl max-w-lg leading-relaxed">Upload your graded assignment and let Regrade analyze your case.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10 bg-white text-primary px-10 py-5 rounded-full group-hover:bg-white/90 transition-all shadow-xl hover:scale-105">
            <span className="font-bold uppercase tracking-[0.3em] text-xs">Get started</span>
            <ICONS.ArrowRight className="group-hover:translate-x-2 transition-transform w-5 h-5" />
          </div>
        </motion.button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group border border-primary/10 shadow-lg bg-white"
          >
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">Your stats</span>
              <ICONS.Trending className="text-primary/30 w-6 h-6" />
            </div>
            <h3 className="text-xs font-semibold text-primary/50 uppercase tracking-[0.2em] mb-2">Points Recovered</h3>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-6xl font-light text-primary tracking-tight">+{latestCase ? '4.2' : '0.0'}</span>
              <span className="text-secondary font-medium text-[10px] uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">Verified</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group border border-primary/10 shadow-lg bg-white"
          >
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">Success rate</span>
              <ICONS.Verified className="text-primary/30 w-6 h-6" />
            </div>
            <h3 className="text-xs font-semibold text-primary/50 uppercase tracking-[0.2em] mb-2">Appeals Successful</h3>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-6xl font-light text-primary tracking-tight">85<span className="text-2xl font-sans opacity-40">%</span></span>
              <span className="text-on-surface-variant font-medium text-[10px] uppercase opacity-60">Platform avg</span>
            </div>
          </motion.div>
        </div>

        <motion.div className="lg:col-span-8 glass-panel rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-full border border-primary/10 bg-white shadow-xl">
          <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
              <ICONS.FileText size={80} className="text-primary/10" />
            </div>
          </div>
          <div className="md:w-3/5 p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#006c49] bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                  {latestCase ? latestCase.status : 'No appeals yet'}
                </span>
                {latestCase && <span className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">{latestCase.ref}</span>}
              </div>
              <h3 className="font-serif text-4xl text-primary font-light leading-tight tracking-tight">
                {latestCase ? latestCase.title : 'No active appeal'}
              </h3>
              <p className="text-lg text-primary/60 font-serif italic leading-relaxed">
                {latestCase ? latestCase.description : 'Start your first appeal to get a detailed analysis of your grading.'}
              </p>
            </div>

            <div className="space-y-6 pt-8 border-t border-primary/5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-primary/50">
                <span>Appeal Progress</span>
                <span className="text-primary">{latestCase ? `${latestCase.progress}% Complete` : '0%'}</span>
              </div>
              <div className="flex gap-4">
                {['Evidence', 'Analyzed', 'Submitted'].map((label, idx) => {
                  const isActive = latestCase && (
                    (idx === 0 && latestCase.evidenceLogged) ||
                    (idx === 1 && latestCase.progress >= 50) ||
                    (idx === 2 && latestCase.status === 'Resolved')
                  );
                  return (
                    <div key={label} className="flex-1 space-y-2">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-primary shadow-sm w-full' : 'bg-primary/10 w-1/2'}`} />
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-primary/30'}`}>{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <button
          onClick={onStartAppeal}
          className="text-left group glass-panel p-8 rounded-3xl hover:bg-primary/5 transition-all border-primary/5"
        >
          <div className="flex items-center justify-between mb-4 text-primary/40 group-hover:text-primary transition-colors">
            <ICONS.BookOpen size={24} strokeWidth={1.5} />
            <ICONS.ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </div>
          <h4 className="font-serif text-2xl text-primary font-light mb-2">Know Your Rights</h4>
          <p className="text-xs text-on-surface-variant/60 font-medium tracking-tight">Most institutions have a formal grade appeal policy. Your professor must follow it.</p>
        </button>

        <button
          onClick={onStartAppeal}
          className="text-left group glass-panel p-8 rounded-3xl hover:bg-primary/5 transition-all border-primary/5"
        >
          <div className="flex items-center justify-between mb-4 text-primary/40 group-hover:text-primary transition-colors">
            <ICONS.MessageSquare size={24} strokeWidth={1.5} />
            <ICONS.ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </div>
          <h4 className="font-serif text-2xl text-primary font-light mb-2">Ask the AI</h4>
          <p className="text-xs text-on-surface-variant/60 font-medium tracking-tight">Not sure if your case is worth appealing? Get an honest assessment before you start.</p>
        </button>
      </section>
    </div>
  );
}
