
import React from 'react';
import { Calendar, AlertCircle, CheckCircle2, Flag, Layers, Archive, ArrowUpDown, Clock, CalendarDays, ArrowDownAZ } from 'lucide-react';
import { SortOption } from '../types';

export type TaskFilterType = 'all' | 'p1' | 'p2' | 'p3' | 'p4' | 'today' | 'overdue' | 'completed';

interface TaskFiltersProps {
  currentFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
  counts: Record<TaskFilterType, number>;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ currentFilter, onFilterChange, counts, sortBy, onSortChange }) => {
  const filters: { id: TaskFilterType; label: string; icon?: React.ReactNode; color?: string }[] = [
    { id: 'all', label: 'All Active', icon: <Layers size={14}/> },
    { id: 'today', label: 'Due Today', icon: <Calendar size={14}/>, color: 'text-emerald-400' },
    { id: 'overdue', label: 'Overdue', icon: <AlertCircle size={14}/>, color: 'text-rose-400' },
    { id: 'p1', label: 'Urgent', icon: <Flag size={14}/>, color: 'text-rose-400' },
    { id: 'p2', label: 'High', icon: <Flag size={14}/>, color: 'text-amber-400' },
    { id: 'p3', label: 'Medium', icon: <Flag size={14}/>, color: 'text-blue-400' },
    { id: 'p4', label: 'Low', icon: <Flag size={14}/>, color: 'text-white/40' },
    { id: 'completed', label: 'Completed', icon: <Archive size={14}/>, color: 'text-white/40' },
  ];

  const sortOptions: { id: SortOption; label: string; icon: React.ReactNode }[] = [
    { id: 'priority', label: 'Priority', icon: <Flag size={14} /> },
    { id: 'dueDate', label: 'Due Date', icon: <CalendarDays size={14} /> },
    { id: 'createdAt', label: 'Added', icon: <Clock size={14} /> },
    { id: 'alphabetical', label: 'A-Z', icon: <ArrowDownAZ size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
        {/* Filters Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {filters.map(f => (
                <button
                    key={f.id}
                    onClick={() => onFilterChange(f.id)}
                    className={`
                        flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                        ${currentFilter === f.id 
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg shadow-zinc-500/10 scale-105' 
                            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                        }
                    `}
                >
                    <span className={currentFilter === f.id ? 'text-inherit' : f.color}>{f.icon}</span>
                    <span>{f.label}</span>
                    <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${currentFilter === f.id ? 'bg-white/20 dark:bg-black/10 text-inherit' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'}`}>
                        {counts[f.id] || 0}
                    </span>
                </button>
            ))}
        </div>

        {/* Sorting Row */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 px-1">
             <ArrowUpDown size={12} />
             <span className="font-semibold uppercase tracking-wider mr-1">Sort by:</span>
             <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                 {sortOptions.map(s => (
                     <button
                        key={s.id}
                        onClick={() => onSortChange(s.id)}
                        className={`
                            flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
                            ${sortBy === s.id
                                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }
                        `}
                     >
                         {s.icon}
                         {s.label}
                     </button>
                 ))}
             </div>
        </div>
    </div>
  );
};
