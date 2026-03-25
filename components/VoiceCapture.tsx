
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, X, Zap, Send, Keyboard, Sparkles } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { ProcessedInput, Project } from '../types';

interface VoiceCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessed: (result: ProcessedInput) => void;
  language?: string;
  projects: Project[];
}

const VoiceCapture: React.FC<VoiceCaptureProps> = ({ isOpen, onClose, onProcessed, language = 'English', projects = [] }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('voice');
      setTextInput('');
      setErrorMessage(null);
    } else {
      stopRecordingAndCleanup();
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'text' && isOpen) {
        setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [mode, isOpen]);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await processInput({ type: 'audio', data: blob, mimeType });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (e) {
      console.error("Microphone access failed", e);
      setErrorMessage("Microphone access denied.");
    }
  };

  const stopRecordingAndCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleStopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop(); 
      }
      setIsRecording(false);
  };

  const handleTextSubmit = async () => {
      if (!textInput.trim()) return;
      await processInput({ type: 'text', data: textInput });
  };

  const processInput = async (input: { type: 'audio' | 'text', data: Blob | string, mimeType?: string }) => {
    setIsProcessing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const now = new Date();
        const dateContext = `Current Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
        const projectNames = projects.map(p => p.name).join(', ');
        
        const systemPrompt = `
        System Instruction: You are Echo, an intelligent productivity assistant.
        ${dateContext}
        Target Language: ${language}
        Available Spaces: [${projectNames}]
        
        Task: Analyze input and extract items.
        Rules:
        - HABIT: Recurring (e.g., "Gym daily").
        - TASK: Actionable (e.g., "Email John").
        - NOTE: Thoughts.
        
        Output JSON matching schema.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ["TASK", "NOTE", "HABIT"] },
                            content: { type: Type.STRING },
                            description: { type: Type.STRING },
                            priority: { type: Type.INTEGER },
                            dueDate: { type: Type.STRING },
                            frequency: { type: Type.STRING, enum: ["daily", "weekly", "monthly"] },
                            projectName: { type: Type.STRING },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["type", "content"]
                    }
                }
            },
            required: ["items"]
        };

        let contents;
        if (input.type === 'audio') {
             const base64Data = await blobToBase64(input.data as Blob);
             contents = {
                parts: [
                    { text: systemPrompt },
                    { inlineData: { mimeType: input.mimeType || 'audio/webm', data: base64Data } }
                ]
             };
        } else {
             contents = {
                parts: [
                    { text: `${systemPrompt}\n\nInput Text: "${input.data}"` }
                ]
             };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const result = response.text ? JSON.parse(response.text) : null;
        if (result) {
            onProcessed(result);
            onClose(); 
        }
    } catch (e) {
        console.error("Gemini processing failed", e);
        setErrorMessage("Could not process input. Try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg p-6 md:p-10 rounded-3xl shadow-2xl flex flex-col gap-6 border border-zinc-200 dark:border-zinc-800 transition-all">
            
            <button 
                onClick={onClose} 
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            {/* Header - Monochrome/Glass */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-inner">
                    <Sparkles size={28} className="text-zinc-600 dark:text-zinc-300" />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Ask Echo
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {isProcessing ? 'Analyzing...' : 'Speak naturally to capture tasks.'}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[200px] flex items-center justify-center w-full">
                {isProcessing ? (
                     <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-zinc-100 dark:border-zinc-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={28} className="text-sky-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 animate-pulse">Processing in {language}...</div>
                     </div>
                ) : mode === 'voice' ? (
                    <div className="flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-bottom-4">
                        <div className="relative group cursor-pointer" onClick={isRecording ? handleStopRecording : startRecording}>
                            {/* Pulse Rings */}
                            {isRecording && (
                                <>
                                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                                    <div className="absolute -inset-6 bg-red-500 rounded-full animate-pulse opacity-10"></div>
                                </>
                            )}
                            
                            <button
                                className={`
                                    relative flex items-center justify-center w-28 h-28 rounded-full transition-all duration-300 transform shadow-xl border-4
                                    ${isRecording 
                                            ? 'bg-red-500 border-red-400 text-white scale-110' 
                                            : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-400 dark:text-zinc-400 hover:scale-105 hover:border-zinc-200 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-200'
                                    }
                                `}
                            >
                                {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={40} />}
                            </button>
                        </div>
                        
                        <div className="text-center">
                             <p className={`text-sm font-medium transition-colors ${isRecording ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                 {isRecording ? 'Listening...' : 'Tap to speak'}
                             </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-4">
                        <textarea
                            ref={textareaRef}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleTextSubmit();
                                }
                            }}
                            placeholder="Describe your task..."
                            className="w-full h-40 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-600 transition-all text-lg"
                        />
                        <div className="flex justify-end">
                             <button
                                onClick={handleTextSubmit}
                                disabled={!textInput.trim()}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all
                                    ${!textInput.trim() 
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                                        : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 shadow-lg'
                                    }
                                `}
                             >
                                 Process <Send size={16} />
                             </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Toggle Mode Footer */}
            {!isProcessing && (
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button 
                        onClick={() => setMode('voice')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mode === 'voice' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        <Mic size={14} /> Voice
                    </button>
                    <button 
                        onClick={() => setMode('text')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mode === 'text' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        <Keyboard size={14} /> Text
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="absolute bottom-4 left-0 right-0 text-center text-rose-500 text-xs font-medium animate-in slide-in-from-bottom-2">
                    {errorMessage}
                </div>
            )}
        </div>
    </div>
  );
};

export default VoiceCapture;
