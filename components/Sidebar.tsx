
import React, { useState } from 'react';
import { 
  LayoutGrid, 
  CheckSquare, 
  Target,
  Book,
  Hexagon,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  CalendarDays,
  Trophy,
  User,
  LogOut
} from 'lucide-react';
import { ViewState, Project, UserProfile } from '../types';

interface SidebarProps {
  currentView: ViewState;
  projects: Project[];
  onViewChange: (view: ViewState) => void;
  onAddProject: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  karma: number;
  user: UserProfile | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  projects,
  onViewChange, 
  onAddProject,
  isMobileOpen,
  onCloseMobile,
  karma,
  user
}) => {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  // Cleaner, less "boxy" active state for dark mode
  const navItemClass = (isActive: boolean) => `
    group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all select-none mb-1
    ${isActive 
      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900/50 dark:text-white dark:shadow-none' 
      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:text-zinc-900 dark:hover:text-zinc-200'}
  `;

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[300px] sm:w-[320px] lg:w-[260px]
        bg-white dark:bg-black 
        border-r border-zinc-200 dark:border-zinc-800 
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-full lg:bg-transparent lg:border-r-0
      `}>
        <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
          
          {/* Logo in Sidebar (Mobile Only) */}
          <div className="lg:hidden mb-10 flex items-center justify-between px-1">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg shadow-zinc-500/10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 8C5 5 9 5 12 8C15 11 19 11 22 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"/>
                        <path d="M2 12C5 9 9 9 12 12C15 15 19 15 22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 16C5 13 9 13 12 16C15 19 19 19 22 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"/>
                    </svg>
                </div>
                <span className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight">EchoFlo</span>
             </div>
             {/* Close button for mobile */}
             <button 
                onClick={onCloseMobile}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
             >
                 <ChevronRight size={20} className="rotate-180 lg:rotate-0" />
             </button>
          </div>

          {/* Main Nav */}
          <nav className="mb-10 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">
                Menu
            </div>
            <div 
              className={navItemClass(currentView.type === 'HOME')}
              onClick={() => { onViewChange({ type: 'HOME' }); onCloseMobile(); }}
            >
              <LayoutGrid size={20} className={currentView.type === 'HOME' ? 'text-brand-500' : ''} />
              <span>Dashboard</span>
            </div>
            <div 
              className={navItemClass(currentView.type === 'TASKS')}
              onClick={() => { onViewChange({ type: 'TASKS' }); onCloseMobile(); }}
            >
              <CheckSquare size={20} className={currentView.type === 'TASKS' ? 'text-brand-500' : ''} />
              <span>My Tasks</span>
            </div>
            <div 
              className={navItemClass(currentView.type === 'CALENDAR')}
              onClick={() => { onViewChange({ type: 'CALENDAR' }); onCloseMobile(); }}
            >
              <CalendarDays size={20} className={currentView.type === 'CALENDAR' ? 'text-brand-500' : ''} />
              <span>Calendar</span>
            </div>
            <div 
              className={navItemClass(currentView.type === 'HABITS')}
              onClick={() => { onViewChange({ type: 'HABITS' }); onCloseMobile(); }}
            >
              <Target size={20} className={currentView.type === 'HABITS' ? 'text-brand-500' : ''} />
              <span>Habits</span>
            </div>
            <div 
              className={navItemClass(currentView.type === 'JOURNAL')}
              onClick={() => { onViewChange({ type: 'JOURNAL' }); onCloseMobile(); }}
            >
              <Book size={20} className={currentView.type === 'JOURNAL' ? 'text-brand-500' : ''} />
              <span>Journal</span>
            </div>
          </nav>

          {/* Spaces Section */}
          <div className="mt-8">
            <div 
                className="flex items-center justify-between px-3 py-2 group cursor-pointer text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-2"
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
            >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                    {isProjectsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <h3>Spaces</h3>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddProject();
                    }}
                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-zinc-500"
                    title="Add Space"
                >
                    <Plus size={16} />
                </button>
            </div>

            {isProjectsExpanded && (
                <nav className="mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {projects.map(project => (
                        <div 
                            key={project.id}
                            className={navItemClass(currentView.type === 'PROJECT' && currentView.id === project.id)}
                            onClick={() => { onViewChange({ type: 'PROJECT', id: project.id }); onCloseMobile(); }}
                        >
                            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-zinc-800 shadow-sm" style={{ backgroundColor: project.color }} />
                            <span className="truncate">{project.name}</span>
                        </div>
                    ))}
                    
                    {projects.length === 0 && (
                        <div className="px-6 py-4 text-xs text-zinc-400 italic">
                            No spaces yet. Tap + to add one.
                        </div>
                    )}
                </nav>
            )}
          </div>
        </div>

        {/* Footer: User Profile */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-black">
            <button 
                onClick={() => { onViewChange({ type: 'SETTINGS' }); onCloseMobile(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white dark:hover:bg-zinc-900 hover:shadow-sm transition-all text-left group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            >
                {user?.picture ? (
                    <img src={user.picture} alt="User" className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
                        <User size={18} />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user?.name}</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                        <Trophy size={11} className="text-amber-500" />
                        {karma} pts
                    </div>
                </div>
                <Settings size={18} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
