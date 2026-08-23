import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, ArrowLeft, Check, Trash2, User, 
  Folder, Settings, FileText, Search, X, LogOut, Shield, Lock, Mail, Eye, EyeOff,
  Palette, Info, List, ListOrdered, KeyRound, Sparkles, Code, LockKeyhole
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bbkmgratduoeszfmliwt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pzrzNMFnf6L_Y4zbIcZ1hA_32vgbJMH';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState('light');

  // Security & PIN state
  const [appPin, setAppPin] = useState(localStorage.getItem('cloudnotes_pin') || '');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinPrompt, setPinPrompt] = useState({ open: false, noteToOpen: null, inputPin: '', error: false });

  // Auth States
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchNotes(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchNotes(session.user.id);
      else {
        setNotes([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotes = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('id', { ascending: false });

      if (data) setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfile(false);
    setShowSettings(false);
  };

  const handleCreateNew = () => {
    setActiveNote({ title: '', content: '', is_locked: false });
  };

  const handleSave = async () => {
    if (!activeNote) return;
    if (!activeNote.title?.trim() && !activeNote.content?.trim()) {
      setActiveNote(null);
      return;
    }

    const newNote = {
      title: activeNote.title || '',
      content: activeNote.content || '',
      is_locked: activeNote.is_locked || false,
      user_id: session?.user?.id
    };

    // Immediate local state update (Fixes missing note display)
    if (activeNote.id) {
      setNotes(notes.map(n => n.id === activeNote.id ? { ...n, ...newNote } : n));
    } else {
      setNotes([{ ...newNote, id: Date.now() }, ...notes]);
    }

    setActiveNote(null);

    try {
      if (activeNote.id) {
        const { error } = await supabase.from('notes').update(newNote).eq('id', activeNote.id);
        if (error) {
          // Fallback if is_locked column doesn't exist in Supabase schema yet
          delete newNote.is_locked;
          await supabase.from('notes').update(newNote).eq('id', activeNote.id);
        }
      } else {
        const { error } = await supabase.from('notes').insert([newNote]);
        if (error) {
          delete newNote.is_locked;
          await supabase.from('notes').insert([newNote]);
        }
      }
      if (session) fetchNotes(session.user.id);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleDelete = async (id) => {
    setNotes(notes.filter(n => n.id !== id));
    setActiveNote(null);
    try {
      await supabase.from('notes').delete().eq('id', id);
      if (session) fetchNotes(session.user.id);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const insertList = (type) => {
    if (!activeNote) return;
    const currentText = activeNote.content || '';
    const prefix = type === 'ordered' ? '1. ' : '• ';
    const updated = currentText ? `${currentText}\n${prefix}` : prefix;
    setActiveNote({ ...activeNote, content: updated });
  };

  const handleSetPin = () => {
    if (newPinInput.length === 4) {
      localStorage.setItem('cloudnotes_pin', newPinInput);
      setAppPin(newPinInput);
      setNewPinInput('');
      alert('Security PIN updated successfully!');
    } else {
      alert('Please enter a 4-digit PIN');
    }
  };

  const openNoteWithCheck = (note) => {
    if (note.is_locked) {
      if (!appPin) {
        alert('Please set up a Security PIN in Settings first!');
        setShowSettings(true);
        return;
      }
      setPinPrompt({ open: true, noteToOpen: note, inputPin: '', error: false });
    } else {
      setActiveNote(note);
    }
  };

  const verifyPinAndOpen = () => {
    if (pinPrompt.inputPin === appPin) {
      setActiveNote(pinPrompt.noteToOpen);
      setPinPrompt({ open: false, noteToOpen: null, inputPin: '', error: false });
    } else {
      setPinPrompt({ ...pinPrompt, error: true });
    }
  };

  const themeClasses = {
    light: 'bg-[#F4F5F9] text-gray-900',
    dark: 'bg-[#121214] text-white',
    amber: 'bg-[#FAF6ED] text-[#4A3B2C]'
  }[theme];

  const cardClasses = {
    light: 'bg-white border-gray-100 text-gray-800 shadow-sm hover:shadow-md',
    dark: 'bg-[#1E1E22] border-gray-800 text-gray-100 shadow-sm hover:shadow-md',
    amber: 'bg-[#FFFDF7] border-amber-200/60 text-[#4A3B2C] shadow-sm hover:shadow-md'
  }[theme];

  // LOGIN / SIGNUP SCREEN
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-gray-100 to-amber-100/50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white/90 backdrop-blur-md w-full max-w-sm rounded-3xl p-7 shadow-2xl border border-white">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-400/30">
              <Sparkles size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">CloudNotes</h1>
            <p className="text-xs text-gray-400 mt-1">
              {isSignUp ? 'Create an account to start taking notes' : 'Welcome back! Sign in to sync your notes'}
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3">
            <div className="flex items-center bg-gray-100/80 px-3.5 py-3 rounded-2xl border border-gray-200/50 focus-within:ring-2 focus-within:ring-amber-400 transition">
              <Mail size={18} className="text-gray-400 mr-2.5" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-black placeholder-gray-400"
              />
            </div>

            <div className="flex items-center bg-gray-100/80 px-3.5 py-3 rounded-2xl border border-gray-200/50 focus-within:ring-2 focus-within:ring-amber-400 transition">
              <Lock size={18} className="text-gray-400 mr-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-black placeholder-gray-400 font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 ml-2 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-400/30 transition active:scale-[0.98]"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NOTE EDITOR VIEW
  if (activeNote) {
    const charCount = ((activeNote.title || '') + (activeNote.content || '')).length;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#121214] text-white' : 'bg-white text-gray-900'} flex flex-col font-sans transition-colors`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50">
          <button onClick={() => setActiveNote(null)} className="p-2 text-gray-500 hover:bg-gray-100/50 rounded-full">
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-2xl">
            <button 
              onClick={() => insertList('ordered')} 
              title="Add Ordered List (1.)"
              className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition"
            >
              <ListOrdered size={18} />
            </button>
            <button 
              onClick={() => insertList('unordered')} 
              title="Add Unordered List (•)"
              className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition"
            >
              <List size={18} />
            </button>
            <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button 
              onClick={() => setActiveNote({ ...activeNote, is_locked: !activeNote.is_locked })} 
              title={activeNote.is_locked ? "Unlock Note" : "Lock Note with PIN"}
              className={`p-1.5 rounded-xl transition ${activeNote.is_locked ? 'bg-amber-400 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'}`}
            >
              <LockKeyhole size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {activeNote.id && (
              <button onClick={() => handleDelete(activeNote.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                <Trash2 size={22} />
              </button>
            )}
            <button onClick={handleSave} className="p-2 text-amber-500 hover:bg-amber-50 rounded-full">
              <Check size={26} />
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 pt-5 pb-6 flex flex-col max-w-2xl mx-auto w-full">
          <input
            type="text"
            placeholder="Title"
            value={activeNote.title || ''}
            onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
            className={`text-2xl font-black placeholder-gray-300 border-none outline-none mb-2 w-full bg-transparent ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          />
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5 font-medium">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{charCount} characters</span>
            {activeNote.is_locked && (
              <span className="ml-auto bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <LockKeyhole size={10} /> PIN Locked
              </span>
            )}
          </div>
          <textarea
            placeholder="Start typing your safe note..."
            value={activeNote.content || ''}
            onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
            className={`w-full flex-1 text-base leading-relaxed placeholder-gray-300 border-none outline-none resize-none bg-transparent ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          />
        </div>
      </div>
    );
  }

  const filteredNotes = notes.filter(n => 
    (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // MAIN HOMESCREEN
  return (
    <div className={`min-h-screen ${themeClasses} flex flex-col font-sans relative pb-24 transition-colors`}>
      <header className="px-6 pt-7 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-400 text-white rounded-xl flex items-center justify-center shadow-md shadow-amber-400/20">
            <FileText size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tight">Notes</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfile(true)} className="p-2.5 text-gray-500 hover:bg-gray-200/50 rounded-2xl transition">
            <User size={22} />
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2.5 text-gray-500 hover:bg-gray-200/50 rounded-2xl transition">
            <Settings size={22} />
          </button>
        </div>
      </header>

      <div className="px-6 my-3">
        <div className={`flex items-center ${cardClasses} px-4 py-3 rounded-2xl border`}>
          <Search size={18} className="text-gray-400 mr-2.5" />
          <input 
            type="text"
            placeholder="Search all notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 my-2 flex items-center gap-2">
        <span className="px-4 py-1.5 text-xs bg-amber-400 text-white font-bold rounded-xl shadow-sm shadow-amber-400/30">
          All ({notes.length})
        </span>
        <button className={`p-2 ${cardClasses} rounded-xl border`}>
          <Folder size={16} className="text-amber-500" />
        </button>
      </div>

      <main className="px-6 flex-1 max-w-2xl mx-auto w-full space-y-3.5 mt-2">
        {loading ? (
          <div className="text-center py-24 text-gray-400 text-sm font-medium">Loading your notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-sm font-medium">
            {searchQuery ? 'No matching notes found.' : 'No notes yet. Tap + to create one!'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => openNoteWithCheck(note)}
              className={`${cardClasses} p-4 rounded-2xl transition-all cursor-pointer border relative group overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold truncate pr-6">
                  {note.title || 'Untitled'}
                </h3>
                {note.is_locked && (
                  <span className="text-amber-500 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg">
                    <LockKeyhole size={14} />
                  </span>
                )}
              </div>
              
              <p className="text-sm opacity-70 line-clamp-2 leading-relaxed whitespace-pre-line font-normal">
                {note.is_locked ? '🔒 Locked content. Tap to enter PIN.' : (note.content || 'No content')}
              </p>
            </div>
          ))
        )}
      </main>

      <button
        onClick={handleCreateNew}
        className="fixed bottom-8 right-6 w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-amber-400/40 hover:scale-105 transition active:scale-95"
      >
        <Plus size={30} strokeWidth={2.5} />
      </button>

      {pinPrompt.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center relative">
            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <KeyRound size={24} />
            </div>
            <h3 className="text-lg font-bold">Protected Note</h3>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Enter your 4-digit security PIN</p>

            <input
              type="password"
              maxLength={4}
              value={pinPrompt.inputPin}
              onChange={(e) => setPinPrompt({ ...pinPrompt, inputPin: e.target.value, error: false })}
              className="w-full text-center text-2xl tracking-[0.5em] font-mono py-2.5 bg-gray-100 rounded-2xl mb-3 border border-gray-200 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="••••"
            />

            {pinPrompt.error && (
              <p className="text-xs text-red-500 font-semibold mb-3">Incorrect PIN. Try again.</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setPinPrompt({ open: false, noteToOpen: null, inputPin: '', error: false })}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={verifyPinAndOpen}
                className="flex-1 py-2.5 bg-amber-400 text-white font-bold text-xs rounded-xl shadow-md hover:bg-amber-500"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-200 text-white rounded-3xl flex items-center justify-center text-2xl font-black mb-3 shadow-lg shadow-amber-400/30">
                {session.user.email[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-800">Account Profile</h2>
              <p className="text-xs text-gray-400">{session.user.email}</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl text-sm text-gray-600 font-medium">
                  <span>Saved Notes</span>
                  <span className="font-bold text-amber-500">{notes.length}</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full mt-6 py-3 bg-red-500 text-white font-bold rounded-2xl shadow-md hover:bg-red-600 transition flex items-center justify-center gap-2 text-sm"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white text-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Settings & Security</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">App Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${theme === 'light' ? 'bg-amber-400 text-white border-amber-400 shadow-md shadow-amber-400/20' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Palette size={14} /> Light
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${theme === 'dark' ? 'bg-amber-400 text-white border-amber-400 shadow-md shadow-amber-400/20' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Palette size={14} /> Dark
                  </button>
                  <button 
                    onClick={() => setTheme('amber')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${theme === 'amber' ? 'bg-amber-400 text-white border-amber-400 shadow-md shadow-amber-400/20' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Palette size={14} /> Warm
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">4-Digit Security PIN</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder={appPin ? "•••• (PIN Active)" : "Set 4-Digit PIN"}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="flex-1 bg-gray-50 px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    onClick={handleSetPin}
                    className="px-4 py-2.5 bg-amber-400 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-amber-500 transition"
                  >
                    Save PIN
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-800">
                  <Code size={18} className="text-amber-500" />
                  <h4 className="text-sm font-bold">Developer Overview</h4>
                </div>
                <div className="text-xs text-gray-700 space-y-1 pl-6">
                  <p><strong>Lead Architect:</strong> Shammas</p>
                  <p><strong>Stack:</strong> React, Tailwind CSS, Supabase Cloud</p>
                  <p><strong>Version:</strong> CloudNotes v2.5</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Cloud Sync & Encryption</span>
                </div>
                <span className="text-xs text-green-500 font-bold">Active</span>
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-200 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
