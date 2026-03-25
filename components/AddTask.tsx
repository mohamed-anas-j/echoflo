
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Flag, Hexagon, Sparkles, X, Loader2 } from 'lucide-react';
import { Priority, Project } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface AddTaskProps {
  projects: Project[];
  defaultProjectId: string;
  onAddTask: (task: { content: string; description?: string; priority: Priority; projectId: string; dueDate?: string }) => void;
  onCancel: () => void;
  language?: string;
}

const AddTask: React.FC<AddTaskProps> = ({ projects, defaultProjectId, onAddTask, onCancel, language = 'English' }) => {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.P4);
  const [projectId, setProjectId] = useState<string>(defaultProjectId);
  const [dueDate, setDueDate] = useState<string>('');
  
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;

    onAddTask({
      content,
      description: description.trim() || undefined,
      priority,
      projectId,
      dueDate: dueDate || undefined
    });
    setContent('');
    setDescription('');
  };

  const getLocalTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSmartAdd = async () => {
      if (!content.trim()) return;
      setIsAiProcessing(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const now = new Date();
        const dateContext = `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
        
        const response = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: `
            You are a smart task parser.
            ${dateContext}
            Spaces: ${JSON.stringify(projects.map(p => p.name))}
            Language: ${language}
            Input: "${content}"
          `,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.INTEGER },
                dueDate: { type: Type.STRING },
                projectName: { type: Type.STRING }
              },
              required: ["content"]
            }
          }
        });

        const result = response.text ? JSON.parse(response.text) : null;
        if (result) {
            setContent(result.content);
            if (result.description) setDescription(result.description);
            if (result.priority) setPriority(result.priority);
            if (result.dueDate) setDueDate(result.dueDate);
            if (result.projectName) {
                const found = projects.find(p => p.name.toLowerCase() === result.projectName.toLowerCase());
                if (found) setProjectId(found.id);
            }
        }
      } catch (e) {
          console.error("AI parse failed", e);
      } finally {
          setIsAiProcessing(false);
      }
  };

  return (
    <div className="group relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
      
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 border border-zinc-200 dark:border-dark-border">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
              <div className="flex items-start gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="What needs to be done?"
                  className="w-full text-lg font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none bg-transparent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isAiProcessing}
                />
                {content.length > 3 && (
                    <button 
                      type="button" 
                      onClick={handleSmartAdd}
                      className="text-brand-500 hover:text-brand-600 transition-colors p-1.5 hover:bg-brand-50 rounded-lg"
                      title="AI Parse"
                    >
                        {isAiProcessing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
                )}
              </div>
            <textarea
              placeholder="Description"
              rows={1}
              className="w-full text-sm text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-300 focus:outline-none resize-none bg-transparent mt-3 font-medium"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isAiProcessing}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                  <button 
                      type="button" 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${dueDate ? 'bg-zinc-100 border-zinc-300 text-zinc-900' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                      onClick={() => {
                          const tomorrowStr = getLocalTomorrowDate();
                          setDueDate(dueDate ? '' : tomorrowStr);
                      }}
                  >
                    <Calendar size={14} />
                    {dueDate ? (dueDate === getLocalTomorrowDate() ? 'Tomorrow' : dueDate) : 'Date'}
                  </button>

                  <div className="relative group/prio">
                      <button type="button" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${priority !== Priority.P4 ? 'text-zinc-900' : 'text-zinc-500'}`}>
                          <Flag size={14} fill={priority !== Priority.P4 ? 'currentColor' : 'none'} className={priority === 1 ? 'text-rose-500' : priority === 2 ? 'text-amber-500' : priority === 3 ? 'text-blue-500' : ''} />
                          Priority
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg hidden group-hover/prio:block z-50 py-1.5">
                          {[Priority.P1, Priority.P2, Priority.P3, Priority.P4].map(p => (
                              <div key={p} onClick={() => setPriority(p)} className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  <Flag size={12} fill="currentColor" className={p === 1 ? 'text-rose-500' : p === 2 ? 'text-amber-500' : p === 3 ? 'text-blue-500' : 'text-zinc-400'}/> 
                                  Priority {p}
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="relative group/space">
                      <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                          <Hexagon size={14} />
                          {projects.find(p => p.id === projectId)?.name || 'Inbox'}
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-40 max-h-48 overflow-y-auto scrollbar-hide bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg hidden group-hover/space:block z-50 py-1.5">
                          <div onClick={() => setProjectId('inbox')} className="px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs font-medium truncate flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                              <Hexagon size={12} /> Inbox
                          </div>
                          {projects.map(p => (
                              <div key={p.id} onClick={() => setProjectId(p.id)} className="px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs font-medium truncate flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: p.color}}></span>
                                  {p.name}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim() || isAiProcessing}
                    className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md shadow-brand-500/20 ${!content.trim() ? 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed shadow-none' : 'bg-zinc-900 dark:bg-white dark:text-black hover:scale-105'}`}
                  >
                    Add Task
                  </button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
