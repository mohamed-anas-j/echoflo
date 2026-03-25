
import React from 'react';
import { FlowItem, Priority } from '../types';
import { Flame, Calendar, CheckCircle2, Zap, ArrowRight, LayoutList } from 'lucide-react';

interface HomeDashboardProps {
  items: FlowItem[];
  username?: string;
  onNavigate: (view: any) => void;
  onComplete: (id: string) => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ items, username = "there", onNavigate, onComplete }) => {
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getLocalToday();
  
  // Logic
  const habits = items.filter(i => i.type === 'HABIT');
  const tasks = items.filter(i => i.type === 'TASK');
  
  // Stats
  const tasksDueToday = tasks.filter(i => !i.isCompleted && i.dueDate === today).length;
  const habitsDoneToday = habits.filter(h => (h.history || []).includes(today)).length;
  const habitsTotal = habits.length;

  // Urgent Tasks
  const urgentTasks = tasks.filter(i => 
    !i.isCompleted && 
    (i.priority === Priority.P1 || (i.dueDate && i.dueDate <= today))
  ).sort((a, b) => {
      const dateA = a.dueDate || '9999-99-99';
      const dateB = b.dueDate || '9999-99-99';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.priority || 4) - (b.priority || 4);
  });

  // Minimal Stat Card
  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
      <div className="bg-white dark:bg-dark-surface p-5 md:p-6 rounded-2xl border border-zinc-100 dark:border-dark-border shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
          <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-1 md:mb-2">{label}</p>
              <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{value}</h3>
          </div>
          <div className={`p-3 md:p-4 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-110 transition-transform`}>
              <Icon size={20} className={`md:w-6 md:h-6 ${colorClass.replace('bg-', 'text-').replace('/10', '')}`} />
          </div>
      </div>
  );

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
             Good day, {username}.
          </h1>
          <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 mt-1 md:mt-2 font-medium">
            You have {tasksDueToday} tasks due today.
          </p>
        </div>
        <div className="self-start md:self-auto text-xs md:text-sm font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
           {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard 
            label="Tasks Due" 
            value={tasksDueToday.toString()} 
            icon={Calendar} 
            colorClass="bg-blue-500 text-blue-600"
          />
          <StatCard 
            label="Habits Done" 
            value={`${habitsDoneToday}/${habitsTotal}`} 
            icon={Flame} 
            colorClass="bg-orange-500 text-orange-600"
          />
          <div className="col-span-2 md:col-span-1">
            <StatCard 
                label="Focus Score" 
                value="85%" 
                icon={Zap} 
                colorClass="bg-emerald-500 text-emerald-600"
            />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Urgent Tasks */}
          <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between pb-2 md:pb-4 border-b border-zinc-200 dark:border-dark-border">
                  <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 md:gap-3">
                      <LayoutList size={20} className="text-zinc-400 md:w-[22px] md:h-[22px]" />
                      Priority Tasks
                  </h2>
                  <button 
                    onClick={() => onNavigate({type: 'TASKS'})}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 uppercase tracking-wide"
                  >
                      View All <ArrowRight size={14} />
                  </button>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                  {urgentTasks.length === 0 ? (
                      <div className="py-12 md:py-16 text-center text-zinc-400 text-sm bg-zinc-50 dark:bg-dark-surface rounded-2xl border border-dashed border-zinc-200 dark:border-dark-border">
                          All caught up. Enjoy your day!
                      </div>
                  ) : (
                      urgentTasks.slice(0, 5).map(task => (
                          <div key={task.id} className="group bg-white dark:bg-dark-surface border border-zinc-200 dark:border-dark-border hover:border-zinc-300 dark:hover:border-zinc-600 p-3 md:p-4 rounded-2xl transition-all flex items-center gap-3 md:gap-4 shadow-sm hover:shadow-md">
                              <button 
                                onClick={() => onComplete(task.id)}
                                className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-zinc-300 dark:border-zinc-600 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white text-transparent transition-all flex items-center justify-center flex-shrink-0"
                              >
                                  <CheckCircle2 size={12} fill="currentColor" className="md:w-[14px] md:h-[14px] opacity-0 hover:opacity-100" />
                              </button>
                              <div className="flex-1 min-w-0">
                                  <div className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">{task.content}</div>
                                  <div className="flex items-center gap-3 mt-0.5 md:mt-1">
                                    {task.dueDate && (
                                        <span className={`text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800 ${task.dueDate < today ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' : 'text-zinc-500'}`}>
                                            {task.dueDate < today ? 'Overdue' : 'Today'}
                                        </span>
                                    )}
                                  </div>
                              </div>
                              <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm ring-2 ring-white dark:ring-zinc-800 ${
                                task.priority === 1 ? 'bg-rose-500' : 
                                task.priority === 2 ? 'bg-amber-500' : 'bg-blue-400'
                              }`} />
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Habits */}
          <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between pb-2 md:pb-4 border-b border-zinc-200 dark:border-dark-border">
                  <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 md:gap-3">
                      <Flame size={20} className="text-zinc-400 md:w-[22px] md:h-[22px]" />
                      Daily Habits
                  </h2>
                  <button 
                    onClick={() => onNavigate({type: 'HABITS'})}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 uppercase tracking-wide"
                  >
                      Manage <ArrowRight size={14} />
                  </button>
              </div>

              <div className="space-y-2 md:space-y-3">
                 {habits.slice(0, 5).map(habit => {
                     const isDoneToday = (habit.history || []).includes(today);
                     return (
                        <div key={habit.id} className={`flex items-center justify-between bg-white dark:bg-dark-surface border border-zinc-200 dark:border-dark-border p-3 md:p-4 rounded-2xl transition-all ${isDoneToday ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-colors ${isDoneToday ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'}`}>
                                    <Flame size={16} className="md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <div className={`text-sm md:text-base font-semibold ${isDoneToday ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>{habit.content}</div>
                                    <div className="text-[10px] md:text-xs text-zinc-500 font-medium mt-0.5">
                                        {habit.streak || 0} day streak
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => onComplete(habit.id)}
                                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isDoneToday 
                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                    : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-transparent'
                                }`}
                            >
                                <CheckCircle2 size={14} className="md:w-4 md:h-4" />
                            </button>
                        </div>
                     );
                 })}
                 {habits.length === 0 && (
                     <div className="py-12 md:py-16 text-center text-zinc-400 text-sm bg-zinc-50 dark:bg-dark-surface rounded-2xl border border-dashed border-zinc-200 dark:border-dark-border">
                         No habits yet.
                     </div>
                 )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
