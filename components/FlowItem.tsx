
import React, { useState, useRef, useEffect } from 'react';
import { Check, MoreHorizontal, Calendar, Edit2, Trash2, Tag, Repeat, Flame, Flag } from 'lucide-react';
import { FlowItem as FlowItemType, Priority } from '../types';

interface FlowItemProps {
  item: FlowItemType;
  onComplete?: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (updates: Partial<FlowItemType>) => void;
}

const FlowItem: React.FC<FlowItemProps> = ({ item, onComplete, onDelete, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [editDescription, setEditDescription] = useState(item.description || '');
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isHabit = item.type === 'HABIT';
  
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isCompleted = isHabit 
      ? (item.history || []).includes(getLocalToday())
      : item.isCompleted;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
      if (onUpdate) {
          onUpdate({
              content: editContent,
              description: editDescription
          });
      }
      setIsEditing(false);
  };
  
  // High contrast priority colors
  const priorityColor = {
      [Priority.P1]: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-900/30 dark:border-rose-800',
      [Priority.P2]: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800',
      [Priority.P3]: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800',
      [Priority.P4]: 'text-zinc-600 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700',
  };

  const MenuDropdown = () => (
      <div 
        ref={menuRef}
        className="absolute right-0 top-12 w-40 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
      >
        <button 
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-3"
        >
            <Edit2 size={14} />
            Edit
        </button>
        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
                setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3"
        >
            <Trash2 size={14} />
            Delete
        </button>
      </div>
  );

  if (isEditing) {
      return (
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700 mb-4">
              <input 
                  autoFocus
                  className="w-full text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 bg-transparent focus:outline-none mb-3"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
              />
              <textarea 
                  className="w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-400 bg-transparent focus:outline-none resize-none"
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Add details..."
              />
              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
                  <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
              </div>
          </div>
      );
  }

  return (
    <div className={`
        group relative flex items-start gap-4 p-4 lg:p-5 mb-3 rounded-2xl transition-all duration-200
        ${isCompleted 
            ? 'bg-zinc-50 dark:bg-zinc-900/50' 
            : 'bg-white dark:bg-dark-surface border border-zinc-200 dark:border-dark-border hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm'
        }
    `}>
        
        {/* Checkbox / Habit Toggle */}
        <button
          onClick={(e) => {
              e.stopPropagation();
              onComplete && onComplete(item.id);
          }}
          className={`
            mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${isHabit
                ? (isCompleted ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-300 dark:border-zinc-600 hover:border-orange-500 text-orange-500')
                : (isCompleted ? 'bg-zinc-300 border-zinc-300 dark:bg-zinc-700 dark:border-zinc-700 text-white' : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-500 hover:bg-blue-500/10')
            }
          `}
        >
          {isHabit && <Flame size={12} fill={isCompleted ? "currentColor" : "none"} className={!isCompleted ? 'opacity-0 hover:opacity-100' : ''} />}
          {!isHabit && isCompleted && <Check size={14} strokeWidth={3} />}
        </button>
        
        <div className="flex-1 min-w-0 pt-0.5">
           <div className="flex items-center justify-between gap-2">
                <div 
                    className={`text-base font-semibold leading-snug break-words transition-colors ${
                        isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-white'
                    }`}
                >
                    {item.content}
                </div>
           </div>
           
           {item.description && !isCompleted && (
               <div className="text-sm mt-2 line-clamp-2 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                   {item.description}
               </div>
           )}
           
           {/* Meta Row */}
           <div className={`flex flex-wrap items-center gap-3 mt-3 ${isCompleted ? 'opacity-50' : ''}`}>
               {/* Date */}
               {item.dueDate && (
                   <div className={`flex items-center gap-1.5 text-xs font-bold ${item.dueDate < getLocalToday() && !isCompleted ? 'text-rose-600' : 'text-zinc-500'}`}>
                       <Calendar size={14} />
                       <span>{new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                   </div>
               )}

               {/* Priority Badge */}
               {!isHabit && item.priority && item.priority < 4 && (
                   <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${priorityColor[item.priority]}`}>
                       <Flag size={12} fill="currentColor" />
                       P{item.priority}
                   </div>
               )}
               
               {/* Habit Streak */}
               {isHabit && item.streak ? (
                   <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50 px-2.5 py-0.5 rounded-full">
                       <Flame size={12} fill="currentColor" /> {item.streak}
                   </div>
               ) : null}

               {/* Tags */}
               {item.tags?.map(tag => (
                   <div key={tag} className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                        <Tag size={12} />
                        {tag}
                   </div>
               ))}
           </div>
        </div>
        
        {/* Actions */}
        <div className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <MoreHorizontal size={20} />
            </button>
            {showMenu && <MenuDropdown />}
        </div>
    </div>
  );
};

export default FlowItem;
