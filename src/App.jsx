import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, ArrowLeft, Check, Trash2, User, 
  Folder, Settings, FileText, Search, X, LogOut, Shield, Lock, Mail, Eye, EyeOff,
  Palette, Info, List, ListOrdered
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
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'amber'

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
        .eq('user_id', userId)
        .order('id', { ascending: false });

      if (error) {
        const { data: allNotes } = await supabase.from('notes').select('*').order('id', { ascending: false });
        if (allNotes) setNotes(allNotes);
      } else if (data) {
        setNotes(data);
      }
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
    setActiveNote({ title: '', content: '' });
  };

  const handleSave = async () => {
    if (!activeNote) return;
    if (!activeNote.title?.trim() && !activeNote.content?.trim()) {
      setActiveNote(null);
      return;
    }

    try {
      const payload = {
        title: activeNote.title,
        content: activeNote.content,
        user_id: session?.user?.id
      };

      if (activeNote.id) {
        await supabase.from('notes').update(payload).eq('id', activeNote.id);
      } else {
        await supabase.from('notes').insert([payload]);
      }
      if (session) await fetchNotes(session.user.id);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setActiveNote(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supabase.from('notes').delete().eq('id', id);
      if (session) await fetchNotes(session.user.id);
    } catch (err) {
      console.error('Error deleting note:', err);
    } finally {
      if (activeNote?.id === id) setActiveNote(null);
    }
  };

  const insertList = (type) => {
    if (!activeNote) return;
    const currentText = activeNote.content || '';
    const prefix = type === 'ordered' ? '1. ' : '• ';
    const updated = currentText ? `${currentText}\n${prefix}` : prefix;
    setActiveNote({ ...activeNote, content: updated });
  };

  // Theme Styling Rules
  const themeClasses = {
    light: 'bg-[#F5F5F7] text-gray-900',
    dark: 'bg-gray-900 text-white',
    amber: 'bg-amber-50 text-amber-900'
  }[theme];

  const cardClasses = {
    light: 'bg-white border-gray-100 text-gray-800',
    dark: 'bg-gray-800 border-gray-700 text-white',
    amber: 'bg-amber-100/50 border-amber-200 text-amber-900'
  }[theme];

  // LOGIN / SIGNUP SCREEN
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-400 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <FileText size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">CloudNotes</h1>
            <p className="text-xs text-gray-400 mt-1">
              {isSignUp ? 'Create an account to start taking notes' : 'Welcome back! Sign in to sync your notes'}
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3">
            <div className="flex items-center bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100">
              <Mail size={18} className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-black placeholder-gray-400"
              />
            </div>

            <div className="flex items-center bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100">
              <Lock size={18} className="text-gray-400 mr-2" />
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
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
              className="text-xs text-amber-500 font-semibold hover:underline"
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
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} flex flex-col font-sans`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={() => setActiveNote(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          
          {/* List Formatting Toolbar */}
          <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-xl">
            <button 
              onClick={() => insertList('ordered')} 
              title="Add Ordered List (1.)"
              className="p-1.5 text-gray-700 hover:bg-white rounded-lg transition"
            >
              <ListOrdered size={18} />
            </button>
            <button 
              onClick={() => insertList('unordered')} 
              title="Add Unordered List (•)"
              className="p-1.5 text-gray-700 hover:bg-white rounded-lg transition"
            >
              <List size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
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

        <div className="flex-1 px-6 pt-4 pb-6 flex flex-col max-w-2xl mx-auto w-full">
          <input
            type="text"
            placeholder="Title"
            value={activeNote.title || ''}
            onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
            className={`text-2xl font-bold placeholder-gray-300 border-none outline-none mb-2 w-full bg-transparent ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          />
          <div className="text-xs text-gray-400 mb-4">
            {formattedDate} | {charCount} characters
          </div>
          <textarea
            placeholder="Start typing your note..."
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
    <div className={`min-h-screen ${themeClasses} flex flex-col font-sans relative pb-20 transition-colors`}>
      <header className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button className="text-amber-500 pb-1 border-b-2 border-amber-500 font-semibold text-lg">
            <FileText size={22} className="inline mr-1" />
            Notes
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfile(true)} className="p-2 text-gray-500 hover:bg-gray-200/50 rounded-full">
            <User size={22} />
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:bg-gray-200/50 rounded-full">
            <Settings size={22} />
          </button>
        </div>
      </header>

      <div className="px-6 my-2">
        <div className={`flex items-center ${cardClasses} px-4 py-2 rounded-2xl shadow-sm border`}>
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 my-2 flex items-center gap-2">
        <span className="px-4 py-1.5 text-xs bg-amber-400 text-white font-semibold rounded-xl shadow-sm">
          All ({notes.length})
        </span>
        <button className={`p-2 ${cardClasses} rounded-xl shadow-sm border`}>
          <Folder size={16} className="text-amber-500" />
        </button>
      </div>

      <main className="px-6 flex-1 max-w-2xl mx-auto w-full space-y-3 mt-2">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading your notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            {searchQuery ? 'No matching notes found.' : 'No notes yet. Tap + to create one!'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`${cardClasses} p-4 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer border`}
            >
              <h3 className="text-base font-bold truncate">
                {note.title || 'Untitled'}
              </h3>
              <p className="text-sm opacity-70 mt-1 line-clamp-2 leading-snug whitespace-pre-line">
                {note.content || 'No content'}
              </p>
            </div>
          ))
        )}
      </main>

      <button
        onClick={handleCreateNew}
        className="fixed bottom-8 right-6 w-14 h-14 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 transition active:scale-95"
      >
        <Plus size={30} strokeWidth={2.5} />
      </button>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                {session.user.email[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-800">Account Profile</h2>
              <p className="text-xs text-gray-400">{session.user.email}</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                  <span>Saved Notes</span>
                  <span className="font-bold text-amber-500">{notes.length}</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full mt-6 py-2.5 bg-red-500 text-white font-semibold rounded-xl shadow-md hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white text-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Theme Picker */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">App Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${theme === 'light' ? 'bg-amber-400 text-white border-amber-400' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Palette size={14} /> Light
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${theme === 'dark' ? 'bg-amber-400 text-white border-amber-400' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Palette size={14} /> Dark
                  </button>
                  <button 
                    onClick={() => setTheme('amber')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${theme === 'amber' ? 'bg-amber-400 text-white border-amber-400' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Palette size={14} /> Warm
                  </button>
                </div>
              </div>

              {/* Developer Info Section */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <Info size={20} className="text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Developer Info</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Developed by **Shammas**</p>
                  <p className="text-[10px] text-gray-400 mt-1">CloudNotes v1.0 • Powered by React & Supabase</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Cloud Sync</span>
                </div>
                <span className="text-xs text-green-500 font-semibold">Active</span>
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
