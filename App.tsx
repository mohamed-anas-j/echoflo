
import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Menu, Plus, LayoutGrid, Search, Moon, Sun, X, CheckCircle2, CalendarDays, Sparkles, Mic } from 'lucide-react';
import Sidebar from './components/Sidebar';
import FlowItem from './components/FlowItem';
import AddTask from './components/AddTask';
import ProjectModal from './components/ProjectModal';
import HomeDashboard from './components/HomeDashboard';
import CalendarView from './components/CalendarView';
import VoiceCapture from './components/VoiceCapture';
import SettingsView from './components/SettingsView';
import Onboarding from './components/Onboarding';
import { TaskFilters, TaskFilterType } from './components/TaskFilters';
import { FlowItem as FlowItemType, ViewState, Priority, Project, HabitFrequency, ProcessedInput, SortOption, UserProfile } from './types';

// Theme Palettes - Simplified to Clean tones
const THEMES: Record<string, Record<number, string>> = {
  blue: {
    50: '240 249 255', 100: '224 242 254', 200: '186 230 253', 300: '125 211 252',
    400: '56 189 248', 500: '14 165 233', 600: '2 132 199', 700: '3 105 161',
    800: '7 89 133', 900: '12 74 110'
  },
  emerald: {
    50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183',
    400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87',
    800: '6 95 70', 900: '6 78 59'
  },
  zinc: {
    50: '250 250 250', 100: '244 244 245', 200: '228 228 231', 300: '212 212 216',
    400: '161 161 170', 500: '113 113 122', 600: '82 82 91', 700: '63 63 70',
    800: '39 39 42', 900: '24 24 27'
  }
};

const INITIAL_PROJECTS: Project[] = [
    { id: 'p-personal', name: 'Personal', color: '#10b981' }, 
    { id: 'p-work', name: 'Work', color: '#0ea5e9' } 
];

const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const INITIAL_ITEMS: FlowItemType[] = [
  {
    id: 'welcome-1',
    type: 'TASK',
    content: 'Welcome to EchoFlo',
    description: 'Use the "Ask Echo" button to capture thoughts with your voice.',
    priority: Priority.P1,
    createdAt: new Date().toISOString(),
    isCompleted: false,
    projectId: 'p-personal',
    tags: ['welcome']
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
      const savedUser = localStorage.getItem('echoflow_user_profile');
      return savedUser ? JSON.parse(savedUser) : null;
  });

  const [items, setItems] = useState<FlowItemType[]>(() => {
    const saved = localStorage.getItem('echoflow_items');
    if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((i: any) => ({...i, history: i.history || []}));
    }
    return INITIAL_ITEMS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('echoflow_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [karma, setKarma] = useState<number>(() => {
      const saved = localStorage.getItem('echoflow_karma');
      return saved ? parseInt(saved) : 0;
  });

  const [brandColor, setBrandColor] = useState<string>(() => {
      return localStorage.getItem('echoflow_color') || 'blue';
  });

  const [targetLanguage, setTargetLanguage] = useState<string>(() => {
      return localStorage.getItem('echoflow_language') || 'English';
  });

  const [viewState, setViewState] = useState<ViewState>({ type: 'HOME' });
  const [habitTab, setHabitTab] = useState<HabitFrequency>('daily');
  const [taskFilter, setTaskFilter] = useState<TaskFilterType>('all');
  const [taskSort, setTaskSort] = useState<SortOption>('priority'); 
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [darkMode, setDarkMode] = useState(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('echoflow_theme') === 'dark' || 
                 (!('echoflow_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
      return true; 
  });
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    localStorage.setItem('echoflow_items', JSON.stringify(items));
    localStorage.setItem('echoflow_projects', JSON.stringify(projects));
    localStorage.setItem('echoflow_karma', karma.toString());
    localStorage.setItem('echoflow_color', brandColor);
    localStorage.setItem('echoflow_language', targetLanguage);
    if (user) {
        localStorage.setItem('echoflow_user_profile', JSON.stringify(user));
    } else {
        localStorage.removeItem('echoflow_user_profile');
    }
  }, [items, projects, karma, user, brandColor, targetLanguage]);

  useEffect(() => {
      if (darkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('echoflow_theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('echoflow_theme', 'light');
      }
  }, [darkMode]);

  useEffect(() => {
    const theme = THEMES[brandColor] || THEMES.blue;
    const root = document.documentElement;
    Object.entries(theme).forEach(([shade, value]) => {
        root.style.setProperty(`--brand-${shade}`, value);
    });
  }, [brandColor]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const calculateStreak = (history: string[]) => {
      if (!history || history.length === 0) return 0;
      
      const sorted = [...new Set(history)].sort().reverse(); 
      const today = getLocalToday();
      
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
      
      if (sorted[0] !== today && sorted[0] !== yesterday) {
          return 0;
      }
      
      let streak = 0;
      for (let i = 0; i < sorted.length; i++) {
          if (i === 0) {
              streak = 1;
              continue;
          }
          const curr = new Date(sorted[i]);
          const prev = new Date(sorted[i-1]);
          const diffTime = Math.abs(prev.getTime() - curr.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
              streak++;
          } else {
              break;
          }
      }
      return streak;
  };

  const handleAddTask = (taskData: { content: string; description?: string; priority: Priority; projectId: string; dueDate?: string }) => {
    const newTask: FlowItemType = {
        id: uuidv4(),
        type: 'TASK',
        content: taskData.content,
        description: taskData.description,
        priority: taskData.priority,
        projectId: taskData.projectId === 'inbox' ? 'inbox' : taskData.projectId,
        dueDate: taskData.dueDate,
        createdAt: new Date().toISOString(),
        isCompleted: false,
        tags: [] 
    };
    setItems(prev => [newTask, ...prev]);
    setShowAddTask(false);
    showToast('Task added');
  };

  const handleVoiceProcessed = (result: ProcessedInput) => {
    if (result.items && result.items.length > 0) {
        const newItems = result.items.map(item => {
            let resolvedProjectId = 'inbox';
            if (item.projectName) {
                const foundProject = projects.find(p => p.name.toLowerCase() === item.projectName?.toLowerCase());
                if (foundProject) resolvedProjectId = foundProject.id;
            }

            return {
                id: uuidv4(),
                type: (item.type || 'TASK') as any,
                content: item.content,
                description: item.description,
                priority: item.priority || Priority.P4,
                dueDate: item.dueDate, 
                projectId: resolvedProjectId, 
                createdAt: new Date().toISOString(),
                isCompleted: false,
                streak: item.streak,
                frequency: (item.frequency || 'daily') as HabitFrequency,
                tags: item.tags || []
            };
        });
        setItems(prev => [...newItems, ...prev]);
        showToast(`Captured ${newItems.length} items`);
    } else {
        showToast('No items detected', 'info');
    }
  };
  
  const handleUpdateItem = (id: string, updates: Partial<FlowItemType>) => {
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      showToast('Item updated', 'info');
  };

  const handleMoveTask = (id: string, newDate: string) => {
      setItems(prev => prev.map(item => item.id === id ? { ...item, dueDate: newDate } : item));
      showToast('Rescheduled');
  };

  const handleAddProject = (name: string, color: string) => {
    const newProject = { id: uuidv4(), name, color };
    setProjects(prev => [...prev, newProject]);
    showToast(`Space "${name}" created`);
  };

  const handleComplete = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const isCompleting = !item.isCompleted;
      const today = getLocalToday();
      
      if (item.type === 'HABIT') {
        const history = item.history || [];
        const isDoneToday = history.includes(today);
        let newHistory = [...history];

        if (isDoneToday) {
            newHistory = newHistory.filter(d => d !== today);
            setKarma(k => Math.max(0, k - 50));
        } else {
            newHistory.push(today);
            showToast('Streak increased! 🌿');
            setKarma(k => k + 50);
        }
        newHistory.sort();
        const newStreak = calculateStreak(newHistory);
        return {
            ...item,
            streak: newStreak,
            history: newHistory,
            lastCompletedDate: isDoneToday ? undefined : today
        };
      }
      
      if (isCompleting) {
          showToast('Completed', 'success');
          setKarma(k => k + 25);
      } else {
          setKarma(k => Math.max(0, k - 25));
      }
      return { ...item, isCompleted: isCompleting };
    }));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    showToast('Deleted', 'info');
  };

  const handleExportData = () => {
      const data = {
          version: 1,
          timestamp: new Date().toISOString(),
          user,
          items,
          projects,
          karma
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `echoflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup downloaded');
  };

  const handleClearData = () => {
      if (window.confirm("Are you sure you want to reset everything? This cannot be undone.")) {
          localStorage.clear();
          setItems(INITIAL_ITEMS);
          setProjects(INITIAL_PROJECTS);
          setKarma(0);
          setUser(null);
          setViewState({ type: 'HOME' });
          setBrandColor('blue');
          setTargetLanguage('English');
          showToast('App reset successfully');
          setTimeout(() => window.location.reload(), 1000);
      }
  };

  const handleLogin = (newUser: UserProfile) => {
      setUser(newUser);
      showToast(`Welcome, ${newUser.name}`);
  };

  const handleLogout = () => {
      setUser(null);
      setViewState({ type: 'HOME' });
      showToast('Logged out');
  };

  const filterCounts = useMemo(() => {
    const today = getLocalToday();
    const tasks = items.filter(i => i.type === 'TASK');
    return {
        all: tasks.filter(i => !i.isCompleted).length,
        p1: tasks.filter(i => !i.isCompleted && i.priority === Priority.P1).length,
        p2: tasks.filter(i => !i.isCompleted && i.priority === Priority.P2).length,
        p3: tasks.filter(i => !i.isCompleted && i.priority === Priority.P3).length,
        p4: tasks.filter(i => !i.isCompleted && i.priority === Priority.P4).length,
        today: tasks.filter(i => !i.isCompleted && i.dueDate === today).length,
        overdue: tasks.filter(i => !i.isCompleted && i.dueDate && i.dueDate < today).length,
        completed: tasks.filter(i => i.isCompleted).length
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    let resultItems = items;
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        resultItems = resultItems.filter(i => 
            i.content.toLowerCase().includes(q) || 
            i.description?.toLowerCase().includes(q) ||
            i.tags?.some(t => t.toLowerCase().includes(q))
        );
    }
    const today = getLocalToday();

    if (viewState.type === 'TASKS') {
        const tasks = resultItems.filter(i => i.type === 'TASK');
        if (taskFilter === 'all') resultItems = tasks.filter(i => !i.isCompleted);
        else if (taskFilter === 'completed') resultItems = tasks.filter(i => i.isCompleted);
        else if (taskFilter === 'p1') resultItems = tasks.filter(i => !i.isCompleted && i.priority === Priority.P1);
        else if (taskFilter === 'p2') resultItems = tasks.filter(i => !i.isCompleted && i.priority === Priority.P2);
        else if (taskFilter === 'p3') resultItems = tasks.filter(i => !i.isCompleted && i.priority === Priority.P3);
        else if (taskFilter === 'p4') resultItems = tasks.filter(i => !i.isCompleted && i.priority === Priority.P4);
        else if (taskFilter === 'today') resultItems = tasks.filter(i => !i.isCompleted && i.dueDate === today);
        else if (taskFilter === 'overdue') resultItems = tasks.filter(i => !i.isCompleted && i.dueDate && i.dueDate < today);
        else resultItems = tasks.filter(i => !i.isCompleted);
    } else if (viewState.type === 'HABITS') {
        resultItems = resultItems.filter(i => i.type === 'HABIT' && (i.frequency || 'daily') === habitTab);
    } else if (viewState.type === 'JOURNAL') {
        resultItems = resultItems.filter(i => i.type === 'NOTE');
    } else if (viewState.type === 'PROJECT') {
        resultItems = resultItems.filter(i => i.projectId === viewState.id && !i.isCompleted);
    } else if (viewState.type === 'TAG') {
        resultItems = resultItems.filter(i => i.tags?.includes(viewState.id || '') && !i.isCompleted);
    } else if (viewState.type === 'CALENDAR') {
        resultItems = resultItems.filter(i => i.type === 'TASK' && !i.isCompleted);
    }

    if (viewState.type === 'TASKS' || viewState.type === 'PROJECT') {
        resultItems = [...resultItems].sort((a, b) => {
            switch (taskSort) {
                case 'priority':
                    return (a.priority || 4) - (b.priority || 4);
                case 'dueDate':
                    const dateA = a.dueDate || '9999-99-99';
                    const dateB = b.dueDate || '9999-99-99';
                    return dateA.localeCompare(dateB);
                case 'createdAt':
                     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'alphabetical':
                    return a.content.localeCompare(b.content);
                default:
                    return 0;
            }
        });
    }

    return resultItems;
  }, [items, viewState, habitTab, searchQuery, taskFilter, taskSort]);

  const getPageTitle = () => {
      if (searchQuery) return 'Search Results';
      switch (viewState.type) {
          case 'HOME': return 'Dashboard';
          case 'SETTINGS': return 'Settings';
          case 'TASKS': return 'My Tasks';
          case 'HABITS': return 'Habits';
          case 'JOURNAL': return 'Journal';
          case 'CALENDAR': return 'Calendar';
          case 'PROJECT': return projects.find(p => p.id === viewState.id)?.name || 'Space';
          case 'TAG': return `# ${viewState.id}`;
          default: return 'Home';
      }
  };

  const renderContent = () => {
      if (viewState.type === 'HOME' && !searchQuery) {
          return (
              <HomeDashboard 
                  items={items}
                  username={user?.name || "there"}
                  onNavigate={setViewState}
                  onComplete={handleComplete}
              />
          );
      }

      if (viewState.type === 'CALENDAR' && !searchQuery) {
          return (
              <CalendarView 
                  items={filteredItems}
                  projects={projects}
                  onMoveTask={handleMoveTask}
                  onComplete={handleComplete}
              />
          );
      }
      
      if (viewState.type === 'SETTINGS') {
          return (
              <SettingsView 
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  user={user}
                  onLogout={handleLogout}
                  onExport={handleExportData}
                  onClearData={handleClearData}
                  brandColor={brandColor}
                  setBrandColor={setBrandColor}
                  targetLanguage={targetLanguage}
                  setTargetLanguage={setTargetLanguage}
              />
          );
      }

      return (
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-32 lg:pb-12">
              <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white mb-1 lg:mb-2 flex items-center gap-2 lg:gap-3 drop-shadow-sm tracking-tight">
                          {getPageTitle()}
                      </h1>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs lg:text-sm font-medium">
                          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                      </p>
                  </div>

                  {viewState.type === 'HABITS' && (
                      <div className="self-start sm:self-auto flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                          {(['daily', 'weekly', 'monthly'] as HabitFrequency[]).map(tab => (
                              <button
                                  key={tab}
                                  onClick={() => setHabitTab(tab)}
                                  className={`px-3 lg:px-4 py-1.5 text-[10px] lg:text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                                      habitTab === tab 
                                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                  }`}
                              >
                                  {tab}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
              
              {(viewState.type === 'TASKS' || viewState.type === 'PROJECT') && !searchQuery && (
                  <TaskFilters 
                      currentFilter={taskFilter}
                      onFilterChange={setTaskFilter}
                      counts={filterCounts}
                      sortBy={taskSort}
                      onSortChange={setTaskSort}
                  />
              )}

              {!showAddTask && !searchQuery && viewState.type !== 'HABITS' && taskFilter !== 'completed' && (
                   <button 
                      onClick={() => setShowAddTask(true)}
                      className="group w-full mb-6 flex items-center gap-3 p-4 lg:p-5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                  >
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors">
                          <Plus size={20} />
                      </div>
                      <span className="font-semibold text-sm lg:text-base">Capture something...</span>
                  </button>
              )}

              {showAddTask && (
                  <div className="mb-8">
                      <AddTask 
                          projects={projects}
                          defaultProjectId={viewState.type === 'PROJECT' && viewState.id ? viewState.id : 'inbox'}
                          onAddTask={handleAddTask}
                          onCancel={() => setShowAddTask(false)}
                          language={targetLanguage}
                      />
                  </div>
              )}

              <div className="space-y-3 lg:space-y-4">
                  {filteredItems.map(item => (
                      <FlowItem 
                          key={item.id} 
                          item={item} 
                          onComplete={handleComplete}
                          onDelete={handleDelete}
                          onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                      />
                  ))}
              </div>
              
              {filteredItems.length === 0 && !showAddTask && (
                  <div className="flex flex-col items-center justify-center py-16 lg:py-24 opacity-60">
                      <div className="w-16 h-16 lg:w-24 lg:h-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 lg:mb-6 border border-zinc-200 dark:border-zinc-700">
                          <LayoutGrid size={32} className="lg:w-10 lg:h-10 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <div className="text-sm lg:text-base font-semibold text-zinc-500 dark:text-zinc-400">
                          {searchQuery ? 'No results found' : 'Everything is organized'}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  if (!user) {
      return (
          <>
            <Onboarding onLogin={handleLogin} />
             {toast && (
                <div className="fixed bottom-12 right-0 md:right-12 z-50 animate-in slide-in-from-right-10 fade-in duration-300 w-full md:w-auto px-4">
                    <div className="glass-panel text-zinc-900 dark:text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 justify-between border-l-4 border-emerald-500">
                         <div className="flex items-center gap-3 font-medium">
                             {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                             <span>{toast.message}</span>
                         </div>
                         <button onClick={() => setToast(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                             <X size={16} />
                         </button>
                    </div>
                </div>
            )}
          </>
      );
  }

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-zinc-50 dark:bg-black selection:bg-brand-200 dark:selection:bg-brand-900">
      {/* Header - Glass */}
      <header className="flex-none h-auto py-3 px-4 lg:py-3 lg:px-6 glass-panel border-b border-zinc-200/50 dark:border-zinc-800 flex items-center justify-between z-20 sticky top-0 lg:m-4 lg:rounded-2xl">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors lg:hidden text-zinc-600 dark:text-zinc-300"
            >
                <Menu size={22} />
            </button>
            <div 
                className="flex items-center gap-2 lg:gap-3 cursor-pointer group"
                onClick={() => setViewState({type: 'HOME'})}
            >
                {/* Fixed Logo Contrast */}
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-zinc-900 to-black dark:from-white dark:to-zinc-200 flex items-center justify-center text-white dark:text-black shadow-lg shadow-zinc-500/10 group-hover:scale-105 transition-transform">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-[22px] lg:h-[22px]">
                        <path d="M2 8C5 5 9 5 12 8C15 11 19 11 22 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"/>
                        <path d="M2 12C5 9 9 9 12 12C15 15 19 15 22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 16C5 13 9 13 12 16C15 19 19 19 22 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"/>
                   </svg>
                </div>
                <span className="font-bold text-lg lg:text-xl tracking-tight hidden lg:block text-zinc-900 dark:text-white">EchoFlo</span>
            </div>
            
            <div className="relative ml-4 lg:ml-8 hidden sm:block group">
                <input 
                    id="header-search"
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`
                        bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 rounded-xl pl-10 pr-4 py-2 text-sm border border-transparent 
                        focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-zinc-800 w-48 focus:w-80 lg:w-64 lg:focus:w-80 lg:py-2.5 transition-all duration-300
                    `}
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-focus-within:text-zinc-600 dark:group-focus-within:text-white transition-colors" />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                        <X size={14} />
                    </button>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3">
              {/* Outstanding "Ask Echo" Feature - Central & Glowing */}
              <button 
                onClick={() => setIsVoiceOpen(true)}
                className="
                    relative overflow-hidden flex items-center gap-2 px-3 py-2 lg:px-6 lg:py-2.5 rounded-full 
                    bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700
                    shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]
                    hover:scale-105 hover:shadow-[0_0_25px_rgba(14,165,233,0.3)]
                    transition-all duration-300 group
                "
              >
                  {/* Inner glowing core */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                     <Sparkles size={12} className="lg:w-3.5 lg:h-3.5" />
                  </div>
                  <span className="font-bold text-xs lg:text-sm tracking-tight hidden sm:inline">Ask Echo</span>
              </button>
              
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden lg:block"></div>

              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 lg:p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                title="Toggle Theme"
              >
                  {darkMode ? <Sun size={20} className="w-5 h-5 lg:w-5 lg:h-5" /> : <Moon size={20} className="w-5 h-5 lg:w-5 lg:h-5" />}
              </button>
          </div>
      </header>

      <div className="flex-1 flex overflow-hidden gap-4 lg:gap-6 lg:p-6 lg:pt-0">
        <Sidebar 
            currentView={viewState}
            projects={projects}
            onViewChange={(view) => { setViewState(view); setSearchQuery(''); }}
            onAddProject={() => setIsProjectModalOpen(true)}
            isMobileOpen={isMobileOpen}
            onCloseMobile={() => setIsMobileOpen(false)}
            karma={karma}
            user={user}
            onLogout={handleLogout}
        />

        <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-t lg:border border-white/40 dark:border-zinc-800/50 shadow-sm lg:rounded-3xl">
            <div className="flex-1 overflow-y-auto scrollbar-hide z-10">
                {renderContent()}
            </div>

            <ProjectModal 
                isOpen={isProjectModalOpen} 
                onClose={() => setIsProjectModalOpen(false)}
                onAdd={handleAddProject}
            />
            
            <VoiceCapture 
                isOpen={isVoiceOpen}
                onClose={() => setIsVoiceOpen(false)}
                onProcessed={handleVoiceProcessed}
                language={targetLanguage}
                projects={projects}
            />

            {toast && (
                <div className="fixed bottom-24 right-4 lg:bottom-12 lg:right-12 z-50 animate-in slide-in-from-right-10 fade-in duration-300 max-w-[90vw]">
                    <div className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-5 py-3 lg:px-6 lg:py-4 rounded-2xl shadow-2xl flex items-center gap-4 justify-between border-l-4 border-emerald-500">
                         <div className="flex items-center gap-3 font-medium text-sm lg:text-base">
                             {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                             <span className="line-clamp-2">{toast.message}</span>
                         </div>
                         <button onClick={() => setToast(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white shrink-0">
                             <X size={16} />
                         </button>
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;
