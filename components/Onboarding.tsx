
import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, LayoutGrid, Zap } from 'lucide-react';
import { UserProfile } from '../types';

declare const google: any;

interface OnboardingProps {
  onLogin: (user: UserProfile) => void;
}

const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const Onboarding: React.FC<OnboardingProps> = ({ onLogin }) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE",
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false
        });

        if (googleBtnRef.current) {
            google.accounts.id.renderButton(googleBtnRef.current, { 
                theme: 'filled_black', 
                size: 'large', 
                text: 'continue_with',
                shape: 'pill',
                width: '100%'
            });
        }
    } else {
        const interval = setInterval(() => {
            if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                clearInterval(interval);
                window.location.reload(); 
            }
        }, 500);
        return () => clearInterval(interval);
    }
  }, []);

  const handleCredentialResponse = (response: any) => {
      const data = parseJwt(response.credential);
      if (data) {
          onLogin({
              id: data.sub,
              name: data.name,
              email: data.email,
              picture: data.picture,
              isGuest: false
          });
      } else {
          setError("Failed to decode user information.");
      }
  };

  const handleGuestLogin = () => {
      onLogin({
          id: 'guest',
          name: 'Guest',
          email: '',
          isGuest: true
      });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Side: Visuals - Updated to Ocean/Slate */}
        <div className="relative p-10 bg-gradient-to-br from-slate-800 to-black text-white flex flex-col justify-between overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 shadow-lg border border-white/10">
                    <Sparkles size={24} className="text-sky-300" />
                </div>
                <h1 className="text-4xl font-bold leading-tight mb-4">
                    Find your rhythm with EchoFlo.
                </h1>
                <p className="text-white/60 text-lg font-medium leading-relaxed">
                    A voice-first workspace that organizes your life, so you can focus on what matters.
                </p>
            </div>

            <div className="relative z-10 space-y-4 mt-8">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <Zap className="text-amber-300" size={20} />
                    <span className="text-sm font-medium">Instant Voice Capture</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <LayoutGrid className="text-sky-300" size={20} />
                    <span className="text-sm font-medium">Smart Organization</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <ShieldCheck className="text-emerald-300" size={20} />
                    <span className="text-sm font-medium">Local-First Privacy</span>
                </div>
            </div>
        </div>

        {/* Right Side: Login */}
        <div className="p-10 flex flex-col justify-center">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Welcome Back</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Sign in to sync your profile and unlock full features.</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-lg flex items-center gap-2">
                    <ShieldCheck size={16} /> {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="h-12 w-full flex justify-center">
                    <div ref={googleBtnRef} className="w-full"></div>
                </div>
                
                {!process.env.GOOGLE_CLIENT_ID && (
                    <p className="text-[10px] text-rose-500 text-center">
                        *Developer: Set GOOGLE_CLIENT_ID env variable to enable Google Sign-In.
                    </p>
                )}

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                    <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs uppercase tracking-wider">Or</span>
                    <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>

                <button 
                    onClick={handleGuestLogin}
                    className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full font-medium transition-all flex items-center justify-center gap-2 group"
                >
                    Continue as Guest
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            <p className="mt-8 text-center text-xs text-zinc-400">
                By continuing, you agree to our Terms of Service and Privacy Policy. <br/>
                EchoFlo stores your data locally in your browser.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
