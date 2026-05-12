import React from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';
import { auth } from '../lib/firebase';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const user = auth.currentUser;
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || '';

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: ICONS.Home },
    { id: 'upload', label: 'Appeal', icon: ICONS.Upload },
    { id: 'history', label: 'History', icon: ICONS.History },
    { id: 'profile', label: 'Profile', icon: ICONS.User },
  ];

  return (
    <div className="min-h-screen flex flex-col relative paper-texture selection:bg-primary/10">
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-3xl institutional-border">
        <div className="max-w-7xl mx-auto px-6 h-14 md:h-24 flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => onTabChange('dashboard')}
          >
            <Logo size="md" className="!text-left" />
          </div>

          <div className="flex items-center gap-12">
            <nav className="hidden md:flex items-center gap-12">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`font-sans text-xs font-black uppercase tracking-[0.4em] transition-all relative py-2 ${
                    activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant/40 hover:text-primary'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(0,35,111,0.2)]"
                    />
                  )}
                </button>
              ))}
            </nav>
            
            <div 
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => onTabChange('profile')}
            >
              {firstName && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-primary opacity-40 leading-none mb-1">Signed in as</p>
                  <p className="text-sm font-black text-primary uppercase">{firstName}</p>
                </div>
              )}
              <div className="w-14 h-14 rounded-2xl border-2 border-primary/10 p-0.5 overflow-hidden bg-white shadow-xl transition-all group-hover:border-primary/40">
                <img
                  src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pb-24 md:pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto px-6 py-8 md:py-16"
        >
          {children}
        </motion.div>
      </main>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 glass-panel rounded-2xl h-16 px-4 flex justify-around items-center border border-primary/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 transition-all w-12 ${
              activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant/40'
            }`}
          >
            <tab.icon className="w-5 h-5" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
