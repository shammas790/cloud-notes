import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, ArrowLeft, Check, Trash2, User, 
  Folder, Settings, FileText, Search, X, LogOut, Shield, Moon
} from 'lucide-react';

// Direct fallback Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bbkmgratduoeszfmliwt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pzrzNMFnf6L_Y4zbIcZ1hA_32vgbJMH';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
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
      if (activeNote.id) {
        await supabase
          .from('notes')
          .update({ title: activeNote.title, content: activeNote.content })
          .eq('id', activeNote.id);
      } else {
        await supabase
          .from('notes')
          .insert([{ title: activeNote.title, content: activeNote.content }]);
      }
      await fetchNotes();
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setActiveNote(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supabase.from('notes').delete().eq('id', id);
      await fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
    } finally {
      if (activeNote?.id === id) setActiveNote(null);
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FULL SCREEN EDITOR VIEW
  if (activeNote) {
    const charCount = ((activeNote.title || '') + (activeNote.content || '')).length;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={() => setActiveNote(null)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
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
            className="text-2xl font-bold placeholder-gray-300 border-none outline-none mb-2 w-full"
          />
          <div className="text-xs text-gray-400 mb-4">
            {formattedDate} | {charCount} characters
          </div>
          <textarea
            placeholder="Start typing your note..."
            value={activeNote.content || ''}
            onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
            className="w-full flex-1 text-base leading-relaxed placeholder-gray-300 border-none outline-none resize-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 flex flex-col font-sans relative pb-20">
      {/* Top Navigation */}
      <header className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button className="text-amber-500 pb-1 border-b-2 border-amber-500 font-semibold text-lg">
            <FileText size={22} className="inline mr-1" />
            Notes
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfile(true)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
            <User size={22} />
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
            <Settings size={22} />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 my-2">
        <div className="flex items-center bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
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

      {/* Category Pills */}
      <div className="px-6 my-2 flex items-center gap-2">
        <span className="px-4 py-1.5 text-xs bg-amber-400 text-white font-semibold rounded-xl shadow-sm">
          All ({notes.length})
        </span>
        <button className="p-2 bg-white text-amber-500 rounded-xl shadow-sm hover:bg-gray-50">
          <Folder size={16} />
        </button>
      </div>

      {/* Notes Grid */}
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
              className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
            >
              <h3 className="text-base font-bold text-gray-800 truncate">
                {note.title || 'Untitled'}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-snug">
                {note.content || 'No content'}
              </p>
            </div>
          ))
        )}
      </main>

      {/* Floating Yellow Plus Button */}
      <button
        onClick={handleCreateNew}
        className="fixed bottom-8 right-6 w-14 h-14 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 transition active:scale-95"
      >
        <Plus size={30} strokeWidth={2.5} />
      </button>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                S
              </div>
              <h2 className="text-xl font-bold text-gray-800">Shammas</h2>
              <p className="text-xs text-gray-400">shammas790@github.com</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                  <span>Total Notes Saved</span>
                  <span className="font-bold text-amber-500">{notes.length}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowProfile(false)}
                className="w-full mt-6 py-2.5 bg-amber-400 text-white font-semibold rounded-xl shadow-md hover:bg-amber-500 transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">App Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Dark Mode</span>
                </div>
                <span className="text-xs text-gray-400">Coming Soon</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Cloud Sync (Supabase)</span>
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
