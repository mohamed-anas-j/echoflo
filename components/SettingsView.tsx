
import React from 'react';
import { User, Moon, Sun, Download, Trash2, Github, Monitor, ShieldCheck, Mail, Palette, Globe, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onExport: () => void;
  onClearData: () => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
}

const COLORS = [
  { id: 'emerald', name: 'Emerald', class: 'bg-emerald-500' },
  { id: 'blue', name: 'Focus Blue', class: 'bg-blue-500' },
  { id: 'rose', name: 'Rose', class: 'bg-rose-500' },
  { id: 'violet', name: 'Violet', class: 'bg-violet-500' },
  { id: 'amber', name: 'Amber', class: 'bg-amber-500' },
  { id: 'zinc', name: 'Monochrome', class: 'bg-zinc-500' },
];

const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese', 'Russian', 'Hindi', 'Arabic'
];

const SettingsView: React.FC<SettingsViewProps> = ({ 
  darkMode, 
  setDarkMode, 
  user,
  onLogout,
  onExport,
  onClearData,
  brandColor,
  setBrandColor,
  targetLanguage,
  setTargetLanguage
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Settings</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Customize your EchoFlo experience.</p>
        </div>

        {/* Profile Section */}
        <section className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <User size={16} /> Profile
            </h2>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-zinc-200 dark:border-dark-border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {user?.picture ? (
                        <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full border-2 border-zinc-100 dark:border-zinc-700" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <User size={24} />
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{user?.name}</h3>
                        <p className="text-sm text-zinc-500">{user?.email || 'Guest User'}</p>
                        {user?.isGuest && <p className="text-xs text-amber-500 mt-1">Data saved locally</p>}
                    </div>
                </div>
                <button 
                    onClick={onLogout}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Monitor size={16} /> Appearance
            </h2>
            
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-zinc-200 dark:border-dark-border shadow-sm space-y-6">
                {/* Theme Mode */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Theme Mode</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setDarkMode(false)}
                            className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                                !darkMode 
                                ? 'bg-brand-50 border-brand-500 text-brand-700' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:bg-dark-surfaceHighlight dark:border-zinc-700 dark:hover:border-zinc-600'
                            }`}
                        >
                            <Sun size={18} />
                            <span className="font-medium text-sm">Light</span>
                        </button>
                        <button 
                            onClick={() => setDarkMode(true)}
                            className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                                darkMode 
                                ? 'bg-zinc-800 border-brand-500 text-white' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:bg-dark-surfaceHighlight dark:border-zinc-700 dark:hover:border-zinc-600'
                            }`}
                        >
                            <Moon size={18} />
                            <span className="font-medium text-sm">Dark</span>
                        </button>
                    </div>
                </div>

                {/* Accent Color */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                        <Palette size={16} />
                        Accent Color
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {COLORS.map(color => (
                            <button
                                key={color.id}
                                onClick={() => setBrandColor(color.id)}
                                className={`
                                    group relative p-2 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2
                                    ${brandColor === color.id 
                                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-500' 
                                        : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                    }
                                `}
                            >
                                <div className={`w-8 h-8 rounded-full shadow-sm ${color.class} ${brandColor === color.id ? 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-zinc-500' : 'group-hover:scale-110 transition-transform'}`} />
                                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{color.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Intelligence Section */}
        <section className="space-y-4">
             <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Globe size={16} /> Intelligence
            </h2>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-zinc-200 dark:border-dark-border shadow-sm">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Default Task Language</label>
                <div className="relative">
                    <select 
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-dark-surfaceHighlight border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-zinc-900 dark:text-white transition-all appearance-none cursor-pointer"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    Voice notes and smart entry will automatically translate tasks to {targetLanguage}.
                </p>
            </div>
        </section>

        {/* Data Section */}
        <section className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} /> Data & Privacy
            </h2>
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-zinc-200 dark:border-dark-border shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-dark-surfaceHighlight/50 transition-colors">
                    <div>
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Export Data</h3>
                        <p className="text-xs text-zinc-500">Download a JSON backup of your tasks and projects.</p>
                    </div>
                    <button 
                        onClick={onExport}
                        className="px-4 py-2 bg-zinc-100 dark:bg-dark-surfaceHighlight text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
                
                <div className="p-4 flex items-center justify-between hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-colors">
                    <div>
                        <h3 className="text-sm font-medium text-rose-600 dark:text-rose-400">Clear All Data</h3>
                        <p className="text-xs text-rose-500/70 dark:text-rose-400/60">Permanently delete all tasks, projects, and settings.</p>
                    </div>
                    <button 
                        onClick={onClearData}
                        className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Reset
                    </button>
                </div>
            </div>
        </section>
        
        <div className="text-center pt-8 text-zinc-400 dark:text-zinc-600 text-xs">
            <p>EchoFlo v1.2.0</p>
            <p className="mt-1">Designed for focus.</p>
        </div>
    </div>
  );
};

export default SettingsView;
