
import React, { useState } from 'react';
import { Check, Calendar, MoreHorizontal, MessageSquareText } from 'lucide-react';
import { Task, Priority } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const priorityBorderColor = {
    [Priority.P1]: 'border-red-500 bg-red-50',
    [Priority.P2]: 'border-orange-500 bg-orange-50',
    [Priority.P3]: 'border-blue-500 bg-blue-50',
    [Priority.P4]: 'border-gray-300 hover:border-gray-400',
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `List 3-5 subtasks for: "${task.content}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
                }
            }
        });
        
        const suggestions: string[] = response.text ? JSON.parse(response.text) : [];
        
        if (suggestions.length > 0) {
            const newDesc = (task.description ? task.description + '\n\n' : '') + "AI Suggestions:\n- " + suggestions.join('\n- ');
            onUpdate({ ...task, description: newDesc });
        }
    } catch (e) {
        console.error("Failed to suggest", e);
    } finally {
        setIsSuggesting(false);
    }
  };

  return (
    <div 
      className="group flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onComplete(task.id)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${priorityBorderColor[task.priority]} group/check`}
      >
        <Check size={12} className="opacity-0 group-hover/check:opacity-100 text-gray-600" />
      </button>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between">
            <div className="text-sm text-gray-800 leading-tight">
                {task.content}
            </div>
        </div>
        
        {task.description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2 whitespace-pre-wrap">
            {task.description}
          </div>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <Calendar size={12} />
              <span>{task.dueDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-1 opacity-0 ${isHovered ? 'opacity-100' : ''} transition-opacity`}>
         <button 
            onClick={(e) => { e.stopPropagation(); handleSuggest(); }}
            className="p-1 text-gray-400 hover:text-purple-600 rounded"
            title="Get AI subtask suggestions"
            disabled={isSuggesting}
         >
             {isSuggesting ? (
                 <div className="w-4 h-4 border-2 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
             ) : (
                <MessageSquareText size={16} />
             )}
         </button>
         <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="Delete task"
         >
             <MoreHorizontal size={16} />
         </button>
      </div>
    </div>
  );
};

export default TaskItem;
