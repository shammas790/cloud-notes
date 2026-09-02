import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowLeft, Check, Trash2, User, 
  Folder, Settings, FileText, Search, X, LogOut, Shield, Mail, Eye, EyeOff,
  Palette, List, ListOrdered, Sparkles, Code, Star, Copy, Download
} from 'lucide-react';

const TEXT_COLORS = [
  { id: 'default', name: 'Default', value: 'text-gray-900 dark:text-white', badge: 'bg-gray-800' },
  { id: 'red', name: 'Red', value: 'text-red-500 font-semibold', badge: 'bg-red-500' },
  { id: 'blue', name: 'Blue', value: 'text-blue-500 font-semibold', badge: 'bg-blue-500' },
  { id: 'green', name: 'Green', value: 'text-green-500 font-semibold', badge: 'bg-green-500' },
  { id: 'yellow', name: 'Yellow', value: 'text-yellow-500 font-semibold', badge: 'bg-yellow-500' },
  { id: 'purple', name: 'Purple', value: 'text-purple-500 font-semibold', badge: 'bg-purple-500' },
  { id: 'orange', name: 'Orange', value: 'text-orange-500 font-semibold', badge: 'bg-orange-500' },
  { id: 'rainbow', name: 'Rainbow', value: 'bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent font-black', badge: 'bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-purple-500' }
];

export default function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('cloudnotes_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('cloudnotes_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Git hub account', content: 'Password :1shammas789\nUsername : shammas790', colorClass: 'text-purple-500 font-semibold', is_starred: true },
      { id: 2, title: 'Email accounts', content: 'Email : personmawk@gmail.com\nPassword : 1abcdef789...', colorClass: 'text-gray-900 dark:text-white', is_starred: false },
      { id: 3, title: 'Microsoft account', content: 'Email : cvshammas7@gmail.com\nPassword : 1abcdef789', colorClass: 'text-gray-900 dark:text-white', is_starred: false }
    ];
  });
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [copiedId, setCopiedId] = useState(null);

  // Auth States
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('personmawk@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Google OAuth Account Selection Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);

  useEffect(() => {
    localStorage.setItem('cloudnotes_data', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('cloudnotes_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('cloudnotes_session');
    }
  }, [session]);

  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    const userSession = {
      user: {
        id: 'user-' + Date.now(),
        email: email || 'shammas@gmail.com'
      }
    };
    setSession(userSession);
  };

  const handleGoogleSignIn = () => {
    setShowGoogleModal(true);
  };

  const handleGoogleContinue = () => {
    const account = selectedGoogleAccount || { email: 'shammas790@gmail.com', name: 'Shammas' };
    const mockSession = {
      user: {
        id: 'google-user-' + Date.now(),
        email: account.email,
        user_metadata: { full_name: account.name }
      }
    };
    setSession(mockSession);
    setShowGoogleModal(false);
  };

  const handleLogout = () => {
    setSession(null);
    setShowProfile(false);
    setShowSettings(false);
  };

  const handleCreateNew = () => {
    setActiveNote({ title: '', content: '', colorClass: 'text-gray-900 dark:text-white', is_starred: false });
  };

  const handleSave = () => {
    if (!activeNote) return;
    if (!activeNote.title?.trim() && !activeNote.content?.trim()) {
      setActiveNote(null);
      return;
    }

    const newNote = {
      ...activeNote,
      content: activeNote.content || '',
      colorClass: activeNote.colorClass || 'text-gray-900 dark:text-white',
      id: activeNote.id || Date.now()
    };

    if (activeNote.id) {
      setNotes(notes.map(n => n.id === activeNote.id ? newNote : n));
    } else {
      setNotes([newNote, ...notes]);
    }

    setActiveNote(null);
  };

  const handleDelete = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    setActiveNote(null);
  };

  const toggleStarNote = (e, note) => {
    e.stopPropagation();
    setNotes(notes.map(n => n.id === note.id ? { ...n, is_starred: !n.is_starred } : n));
  };

  const copyToClipboard = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportNotes = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CloudNotes_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const insertList = (type) => {
    if (!activeNote) return;
    const currentText = activeNote.content || '';
    const prefix = type === 'ordered' ? '1. ' : '• ';
    const updated = currentText ? `${currentText}\n${prefix}` : prefix;
    setActiveNote({ ...activeNote, content: updated });
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

  // LOGIN SCREEN
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

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full mb-4 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center gap-3 transition active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign in with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-400 font-medium">or email</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

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

        {/* Google Account Selection Modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-gray-900 w-full max-w-xs rounded-3xl p-6 shadow-2xl relative text-center">
              <button 
                onClick={() => setShowGoogleModal(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>

              <svg className="w-10 h-10 mx-auto mb-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>

              <h3 className="text-base font-bold text-gray-800">Choose an account</h3>
              <p className="text-xs text-gray-400 mb-4">to continue to CloudNotes</p>

              <div className="space-y-2 mb-5 text-left">
                {[
                  { email: 'shammas790@gmail.com', name: 'Shammas' },
                  { email: 'cvshammas7@gmail.com', name: 'Shammas CV' }
                ].map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => setSelectedGoogleAccount(acc)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                      selectedGoogleAccount?.email === acc.email 
                        ? 'border-amber-400 bg-amber-50' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-9 h-9 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {acc.name[0]}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-800 truncate">{acc.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{acc.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGoogleContinue}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs rounded-2xl shadow-md transition"
              >
                Continue to Notes
              </button>
            </div>
          </div>
        )}
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
              onClick={() => setActiveNote({ ...activeNote, is_starred: !activeNote.is_starred })} 
              title={activeNote.is_starred ? "Unpin Note" : "Pin Note to Top"}
              className={`p-1.5 rounded-xl transition ${activeNote.is_starred ? 'bg-amber-400 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'}`}
            >
              <Star size={18} />
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

        {/* Color Palette Bar */}
        <div className="flex items-center gap-2 px-6 pt-4 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Text Color:</span>
          {TEXT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveNote({ ...activeNote, colorClass: c.value })}
              className={`w-6 h-6 rounded-full ${c.badge} border-2 transition ${activeNote.colorClass === c.value ? 'scale-125 border-black dark:border-white shadow-md' : 'border-transparent opacity-80 hover:opacity-100'}`}
              title={c.name}
            />
          ))}
        </div>

        <div className="flex-1 px-6 pt-4 pb-6 flex flex-col max-w-2xl mx-auto w-full">
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
          </div>
          <textarea
            placeholder="Start typing your note..."
            value={activeNote.content || ''}
            onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
            className={`w-full flex-1 text-base leading-relaxed placeholder-gray-300 border-none outline-none resize-none bg-transparent ${activeNote.colorClass || 'text-gray-900 dark:text-white'}`}
          />
        </div>
      </div>
    );
  }

  const filteredNotes = notes
    .filter(n => 
      (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.is_starred ? 1 : 0) - (a.is_starred ? 1 : 0));

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
              onClick={() => setActiveNote(note)}
              className={`${cardClasses} p-4 rounded-2xl transition-all cursor-pointer border relative group overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 flex-1 pr-2">
                  <h3 className="text-base font-bold truncate">
                    {note.title || 'Untitled Note'}
                  </h3>
                  {note.is_starred && (
                    <span className="text-amber-500">
                      <Star size={14} fill="currentColor" />
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5">
                  {note.content && (
                    <button 
                      onClick={(e) => copyToClipboard(e, note.content, note.id)} 
                      title="Copy note content"
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-amber-500 transition"
                    >
                      {copiedId === note.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  )}
                  <button 
                    onClick={(e) => toggleStarNote(e, note)} 
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-amber-500 transition"
                  >
                    <Star size={14} fill={note.is_starred ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
              
              <p className={`text-sm line-clamp-2 leading-relaxed whitespace-pre-line font-medium ${note.colorClass || 'opacity-70'}`}>
                {note.content && note.content.trim() ? note.content : 'No detailed body text entered.'}
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

      {showProfile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-200 text-white rounded-3xl flex items-center justify-center text-2xl font-black mb-3 shadow-lg shadow-amber-400/30">
                {(session?.user?.email || 'U')[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-800">Account Profile</h2>
              <p className="text-xs text-gray-400">{session?.user?.email}</p>
              
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
              <h2 className="text-lg font-bold text-gray-800">Settings</h2>
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

              <button
                onClick={exportNotes}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-2xl border border-gray-200 flex items-center justify-center gap-2 transition"
              >
                <Download size={16} /> Backup & Export Notes
              </button>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-800">
                  <Code size={18} className="text-amber-500" />
                  <h4 className="text-sm font-bold">Developer Overview</h4>
                </div>
                <div className="text-xs text-gray-700 space-y-1 pl-6">
                  <p><strong>Lead Architect:</strong> Shammas</p>
                  <p><strong>Stack:</strong> React, Tailwind CSS, Local Storage</p>
                  <p><strong>Version:</strong> CloudNotes v3.8</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                </div>
                <span className="text-xs text-green-500 font-bold">Offline Ready</span>
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
