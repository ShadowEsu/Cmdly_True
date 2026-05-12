import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS } from '../constants';
import Advocate from './Advocate';
import { caseService } from '../services/caseService';
import { scanContentForThreats } from '../lib/securityScanner';

export default function UploadCenter({ onSubmit }: { onSubmit: (caseId?: string) => void }) {
  const [step, setStep] = useState(1);
  const [assignmentText, setAssignmentText] = useState('');
  const [rubricText, setRubricText] = useState('');
  const [feedback, setFeedback] = useState('');

  const [showAdvocate, setShowAdvocate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('New Academic Appeal');
  const [securityError, setSecurityError] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; progress: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
    }, 400);
  };

  const handleFiles = (files: FileList) => {
    // NOTE: File upload UI is presentational — PDF parsing is not yet implemented.
    // Files are staged for display only. The actual analysis uses the text fields below.
    // To implement: use Firebase Storage + a Cloud Function to extract PDF text,
    // then pipe the result into assignmentText.
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      progress: 0
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => simulateUpload(f.id));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    if (!assignmentText || !rubricText || !feedback) {
      setSecurityError("Please fill in all three fields — your assignment, the rubric, and your professor's feedback — before submitting.");
      return;
    }

    setLoading(true);
    setSecurityError(null);

    try {
      // AI Security Check on the combined input
      const combinedInput = `Assignment: ${assignmentText}\nRubric: ${rubricText}\nFeedback: ${feedback}`;
      const scanResult = await scanContentForThreats(combinedInput, 'appeal');
      
      if (!scanResult.isSafe) {
        setSecurityError(scanResult.recommendation || "Your submission contains content that can't be processed. Please review and try again.");
        setLoading(false);
        return;
      }

      // Perform the comprehensive AI analysis
      const { performComprehensiveAnalysis } = await import('../lib/gemini');
      const analysisResult = await performComprehensiveAnalysis(assignmentText, rubricText, feedback);

      const docRef = await caseService.createCase({
        title: title || analysisResult.assignment.title || 'New Appeal',
        description: `Analysis complete for ${analysisResult.assignment.subject || 'your assignment'}. Case strength: ${analysisResult.case_analysis.overall_case_strength}.`,
        ref: `C-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Draft Ready',
        progress: 66,
        evidenceLogged: true,
        facultyReview: false,
        analysis: analysisResult,
        rawInput: {
          assignment: assignmentText,
          rubric: rubricText,
          feedback: feedback
        }
      });
      onSubmit(docRef.id);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setSecurityError(err.message || "Analysis failed. Please check that your text is readable and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showAdvocate) {
    return <Advocate onBack={() => setShowAdvocate(false)} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative max-w-7xl mx-auto">
      {/* Left: Input Columns */}
      <div className="lg:col-span-8 space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-primary/10" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">Step 1 of 3 — Upload Evidence</span>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary font-light text-center md:text-left tracking-tight">Build Your Appeal</h1>
          <p className="text-xl md:text-2xl text-on-surface-variant/80 max-w-2xl leading-relaxed font-serif text-center md:text-left">
            Paste the details of your assignment below. Regrade will analyze your grade and help you write a clear, professional appeal.
          </p>
        </section>

          {/* New Gradescope Centric Input */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-[3rem] p-12 space-y-10 border-primary/10 bg-white"
          >
            <div className="flex items-center justify-between border-b border-primary/5 pb-8">
              <div className="flex items-center gap-6">
                <span className="text-4xl font-serif text-primary/30 italic font-light">01</span>
                <div>
                  <h2 className="font-serif text-3xl text-primary font-medium tracking-tight uppercase">Your Assignment</h2>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/50 mt-1">Upload a file or paste the text below</p>
                </div>
              </div>
              <div className="bg-primary/5 p-4 rounded-3xl">
                 <ICONS.FileText className="text-primary w-8 h-8" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => document.getElementById('file-upload-1')?.click()}
                className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center space-y-4 transition-all cursor-pointer group ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-primary/10 bg-primary/5 hover:bg-primary/[0.07] hover:border-primary/30'
                }`}
              >
                <input id="file-upload-1" type="file" className="hidden" accept=".pdf,.doc,.docx,image/*" />
                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-primary/5 group-hover:scale-110 transition-transform">
                  <ICONS.Upload className="text-primary w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-xl text-primary font-bold">Upload File</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">PDF, Word doc, or photo of your graded work</p>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-center">
                <div className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/5">
                   <div className="bg-primary/5 p-3 rounded-xl text-primary">
                      <ICONS.Search size={20} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">Enter Manually</p>
                      <p className="text-[10px] text-primary/40 italic">Type or paste your assignment details below</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/5">
                   <div className="bg-primary/5 p-3 rounded-xl text-primary">
                      <ICONS.Info size={20} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">Need help?</p>
                      <p className="text-[10px] text-primary/40 italic">Ask the AI assistant what to include</p>
                   </div>
                </div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <ICONS.Info className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  File upload is saved for reference. To analyze your grade, please also paste the text from your assignment, rubric, and feedback in the fields below — the AI reads text, not PDFs.
                </p>
              </div>
            )}

            <div className="space-y-6 pt-6 border-t border-primary/5">
              <div className="flex items-center justify-between px-2">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/50">Paste your assignment text</label>
                <span className="text-[10px] font-mono text-primary/20 italic">Required</span>
              </div>
              <textarea
                value={assignmentText}
                onChange={(e) => setAssignmentText(e.target.value)}
                maxLength={8000}
                className="w-full h-40 bg-white border border-primary/10 rounded-[2rem] p-8 focus:ring-[12px] focus:ring-primary/[0.03] focus:border-primary/20 transition-all text-base outline-none resize-none font-serif italic text-primary/80 placeholder:text-primary/10 leading-relaxed"
                placeholder="Paste the text of your assignment or describe what you submitted..."
              />
            </div>
          </motion.div>

          {/* New Unified Audit Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-[3rem] p-12 space-y-12 border-primary/10 bg-white shadow-2xl shadow-primary/5"
          >
            <div className="flex items-center gap-6 border-b border-primary/5 pb-6">
              <span className="text-4xl font-serif text-primary/30 italic font-light">02</span>
              <div>
                <h2 className="font-serif text-3xl text-primary font-medium tracking-tight uppercase">Grading Details</h2>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/50 mt-1">Rubric and professor feedback</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/50 ml-4 group flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                   Grading Rubric
                </label>
                <textarea 
                  value={rubricText}
                  onChange={(e) => setRubricText(e.target.value)}
                  className="w-full h-64 bg-white border border-primary/10 rounded-[2.5rem] p-8 focus:ring-[12px] focus:ring-primary/[0.03] focus:border-primary/20 transition-all text-sm outline-none resize-none font-serif italic text-primary/80 placeholder:text-primary/10"
                  maxLength={4000}
                  placeholder="Paste the rubric — point values, grading criteria, or the scoring guide your professor used..."
                />
              </div>

              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/50 ml-4 group flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500/20" />
                   Professor's Feedback
                </label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full h-64 bg-white border border-primary/10 rounded-[2.5rem] p-8 focus:ring-[12px] focus:ring-primary/[0.03] focus:border-primary/20 transition-all text-sm outline-none resize-none font-serif italic text-primary/80 placeholder:text-primary/10"
                  maxLength={4000}
                  placeholder="Paste your professor's comments, the points deducted, and any written feedback on your work..."
                />
              </div>
            </div>
          </motion.div>

          {securityError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4 text-red-700"
            >
              <ICONS.ShieldAlert size={24} className="flex-shrink-0" />
              <div>
                <p className="text-sm font-bold uppercase tracking-widest mb-1">Please review your input</p>
                <p className="text-xs font-serif italic">{securityError}</p>
              </div>
            </motion.div>
          )}
        <div className="flex justify-between items-center pt-8 border-t border-primary/5 animate-pulse-slow">
          <div className="flex items-center gap-3">
            <ICONS.Shield className="text-primary/20" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Your data is private and encrypted</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-6 bg-primary text-white px-14 py-6 rounded-[2rem] font-bold uppercase tracking-[0.3em] text-[10px] hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all group disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Analyzing...' : 'Analyze My Appeal'}
            {!loading && <ICONS.ArrowRight className="group-hover:translate-x-2 transition-transform opacity-60" />}
          </button>
        </div>
      </div>

      {/* Right Sidebar: Status */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-panel rounded-2xl p-8 space-y-8 sticky top-24">
          <h3 className="font-serif text-2xl text-primary">Your Checklist</h3>

          {(() => {
            const steps = [
              { label: 'Assignment text', done: assignmentText.trim().length > 0, hint: 'Paste your assignment or submission' },
              { label: 'Grading rubric', done: rubricText.trim().length > 0, hint: 'Paste the rubric or grading criteria' },
              { label: 'Professor\'s feedback', done: feedback.trim().length > 0, hint: 'Paste the comments on your work' },
            ];
            const doneCount = steps.filter(s => s.done).length;
            const pct = Math.round((doneCount / steps.length) * 100);

            return (
              <>
                <div className="space-y-8 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-primary/10" />
                  {steps.map((s, i) => (
                    <div key={i} className={`flex gap-6 relative transition-opacity ${!s.done && i > 0 && !steps[i-1].done ? 'opacity-30' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${s.done ? 'bg-secondary' : 'bg-on-surface-variant/10 border border-on-surface-variant/20'}`}>
                        {s.done
                          ? <ICONS.Check className="text-white w-4 h-4" />
                          : <div className="w-2 h-2 rounded-full bg-on-surface-variant" />}
                      </div>
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${s.done ? 'text-secondary' : 'text-primary/40'}`}>
                          {s.done ? 'Done' : 'Needed'}
                        </p>
                        <p className="text-sm font-bold text-primary">{s.label}</p>
                        {!s.done && <p className="text-[11px] text-on-surface-variant opacity-60">{s.hint}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-primary/5">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ready</span>
                    <span className="text-lg font-serif font-bold text-primary">{pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-primary/5 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      className="h-full bg-primary shadow-[0_0_10px_rgba(0,35,111,0.3)]"
                    />
                  </div>
                </div>
              </>
            );
          })()}

          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3">
            <ICONS.Info className="text-primary w-5 h-5 flex-shrink-0" />
            <p className="text-[11px] text-primary/80 font-medium leading-relaxed italic">
              The more detail you provide, the stronger the analysis. Include point values, question numbers, and exact comments where possible.
            </p>
          </div>
        </div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowAdvocate(true)}
          className="glass-panel rounded-2xl overflow-hidden aspect-[4/3] relative group cursor-pointer"
        >
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
            alt="Help" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-80" />
          <div className="absolute bottom-6 left-6 right-6">
             <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">AI Assistant</p>
             <h4 className="font-serif text-2xl text-white leading-tight">Not sure what to include? Ask for help.</h4>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
