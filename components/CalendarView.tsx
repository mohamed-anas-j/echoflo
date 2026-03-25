
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, Plus, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { FlowItem, Project, Priority } from '../types';

interface CalendarViewProps {
  items: FlowItem[];
  projects: Project[];
  onMoveTask: (taskId: string, newDate: string) => void;
  onComplete: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ items, projects, onMoveTask, onComplete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  const dates: { day: number; isCurrentMonth: boolean; dateString: string }[] = [];

  function formatDate(d: Date) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
  }

  // Previous month filler
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevDate = new Date(year, month - 1, d);
    dates.push({ 
        day: d, 
        isCurrentMonth: false,
        dateString: formatDate(prevDate)
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    dates.push({ 
        day: i, 
        isCurrentMonth: true,
        dateString: formatDate(date)
    });
  }

  // Next month filler (to 42 cells grid)
  const remainingCells = 42 - dates.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    dates.push({ 
        day: i, 
        isCurrentMonth: false, 
        dateString: formatDate(date)
    });
  }

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const todayStr = formatDate(new Date());

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
        onMoveTask(taskId, dateStr);
    }
  };

  const getPriorityColor = (priority?: Priority) => {
      switch(priority) {
          case Priority.P1: return 'bg-rose-500';
          case Priority.P2: return 'bg-amber-500';
          case Priority.P3: return 'bg-blue-500';
          default: return 'bg-zinc-300 dark:bg-zinc-600';
      }
  };

  const getPriorityBorderColor = (priority?: Priority) => {
      switch(priority) {
          case Priority.P1: return 'border-rose-400 bg-rose-50 dark:bg-rose-900/20';
          case Priority.P2: return 'border-amber-400 bg-amber-50 dark:bg-amber-900/20';
          case Priority.P3: return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20';
          default: return 'border-zinc-200 bg-white dark:bg-dark-surfaceHighlight';
      }
  };

  // Filter tasks for the selected date list view (Mobile/Tablet focus)
  const selectedDateTasks = items.filter(item => item.dueDate === selectedDateStr && !item.isCompleted);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 md:hidden mt-0.5">
                Tap a date to view tasks
            </p>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
            <button onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDateStr(formatDate(now));
            }} className="px-3 py-1.5 text-xs md:text-sm font-bold bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mr-2">
                Today
            </button>
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-300" />
            </button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <ChevronRight size={20} className="text-zinc-600 dark:text-zinc-300" />
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:overflow-hidden">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
            {/* Headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-dark-surface p-2 text-center text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <span className="md:hidden">{day}</span>
                    <span className="hidden md:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
                </div>
            ))}

            {/* Cells */}
            {dates.map((d, index) => {
                const tasksForDay = items.filter(item => 
                    item.dueDate === d.dateString && !item.isCompleted
                );
                
                const isSelected = d.dateString === selectedDateStr;
                const isToday = d.dateString === todayStr;

                return (
                    <div 
                        key={index}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, d.dateString)}
                        onClick={() => setSelectedDateStr(d.dateString)}
                        className={`
                            relative bg-white dark:bg-dark-surface transition-all cursor-pointer group
                            flex flex-col
                            ${!d.isCurrentMonth ? 'bg-zinc-50/50 dark:bg-dark-surface/50 text-zinc-400' : ''}
                            ${isSelected ? 'ring-2 ring-inset ring-brand-500 z-10' : ''}
                            
                            /* Mobile Sizing */
                            h-14 sm:h-20 
                            
                            /* Desktop Sizing */
                            md:h-32 md:p-2
                        `}
                    >
                        {/* Date Number */}
                        <div className={`
                            text-[10px] md:text-xs font-bold p-1 md:p-0 mb-1 flex justify-center md:justify-start
                            ${isToday 
                                ? 'text-brand-600 dark:text-brand-400' 
                                : 'text-zinc-500 dark:text-zinc-400'}
                        `}>
                            <span className={`
                                w-6 h-6 flex items-center justify-center rounded-full
                                ${isToday ? 'bg-brand-50 dark:bg-brand-900/30' : ''}
                                ${isSelected && !isToday ? 'bg-zinc-100 dark:bg-zinc-800' : ''}
                            `}>
                                {d.day}
                            </span>
                        </div>
                        
                        {/* Mobile: Dots Indicator */}
                        <div className="flex md:hidden justify-center gap-0.5 flex-wrap px-1">
                            {tasksForDay.slice(0, 4).map(task => (
                                <div key={task.id} className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                            ))}
                            {tasksForDay.length > 4 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                            )}
                        </div>

                        {/* Desktop: Task List */}
                        <div className="hidden md:flex flex-col gap-1 overflow-y-auto scrollbar-hide flex-1">
                            {tasksForDay.map(task => (
                                <div 
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className={`
                                        group/task text-[10px] p-1.5 rounded border-l-2 shadow-sm cursor-move select-none truncate
                                        ${getPriorityBorderColor(task.priority)} dark:border-l-4 hover:opacity-80
                                    `}
                                >
                                    {task.content}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
          </div>

          {/* Mobile Selected Date Detail View */}
          <div className="md:hidden mt-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                      {new Date(selectedDateStr).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      {selectedDateTasks.length} tasks
                  </span>
              </div>
              
              <div className="space-y-2 pb-20">
                  {selectedDateTasks.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                          <CalendarIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                          <p className="text-xs text-zinc-400">No tasks for this day</p>
                      </div>
                  ) : (
                      selectedDateTasks.map(task => (
                          <div key={task.id} className="flex items-start gap-3 p-3 bg-white dark:bg-dark-surface rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                               <button 
                                  onClick={() => onComplete(task.id)}
                                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                      task.priority === Priority.P1 ? 'border-rose-400' : 
                                      task.priority === Priority.P2 ? 'border-amber-400' :
                                      'border-zinc-300 dark:border-zinc-600'
                                  }`}
                               >
                                  <div className="w-2.5 h-2.5 rounded-full bg-transparent hover:bg-zinc-400" />
                               </button>
                               <div className="min-w-0">
                                   <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{task.content}</p>
                                   {task.description && <p className="text-xs text-zinc-500 line-clamp-1">{task.description}</p>}
                               </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default CalendarView;
