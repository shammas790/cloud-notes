import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, ArrowLeft, Check, Trash2, User, 
  Folder, Settings, FileText, Search 
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setNotes(data);
  };

  const handleCreateNew = () => {
    setActiveNote({ title: '', content: '' });
  };

  const handleSave = async () => {
    if (!activeNote.title && !activeNote.content) {
      setActiveNote(null);
      return;
    }

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

    fetchNotes();
    setActiveNote(null);
  };

  const handleDelete = async (id) => {
    await supabase.from('notes').delete().eq('id', id);
    fetchNotes();
    if (activeNote?.id === id) setActiveNote(null);
  };

  if (activeNote) {
    const charCount = (activeNote.title + activeNote.content).length;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <button onClick={() => setActiveNote(null)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            {activeNote.id && (
              <button onClick={() => handleDelete(activeNote.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                <Trash2 size={22} />
              </button>
            )}
            <button onClick={handleSave} className="p-2 text-gray-800 hover:bg-gray-100 rounded-full">
              <Check size={26} />
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col max-w-2xl mx-auto w-full">
          <input
            type="text"
            placeholder="Title"
            value={activeNote.title}
            onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
            className="text-2xl font-medium placeholder-gray-300 border-none outline-none mb-2 w-full"
          />
          <div className="text-xs text-gray-400 mb-6 font-normal">
            {formattedDate} | {charCount} characters
          </div>
          <textarea
            placeholder="Start typing..."
            value={activeNote.content}
            onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
            className="w-full flex-1 text-base leading-relaxed placeholder-gray-300 border-none outline-none resize-none font-normal"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 flex flex-col font-sans relative pb-20">
      <header className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button className="text-amber-500 pb-1 border-b-2 border-amber-500 font-semibold text-lg">
            <FileText size={22} className="inline mr-1" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 pb-1 font-semibold text-lg">
            <Check size={22} className="inline" />
          </button>
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
          <Settings size={22} />
        </button>
      </header>

      <div className="px-6 my-3 flex items-center gap-2">
        <span className="px-3 py-1 text-xs bg-white text-gray-700 font-medium rounded-xl shadow-sm">
          All
        </span>
        <button className="p-1.5 bg-white text-yellow-500 rounded-xl shadow-sm hover:bg-gray-50">
          <Folder size={16} />
        </button>
      </div>

      <main className="px-6 flex-1 max-w-2xl mx-auto w-full space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No notes yet. Tap + to create one!
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNote(note)}
              className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <h3 className="text-base font-semibold text-gray-800 truncate">
                {note.title || 'Untitled'}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-snug">
                {note.content || 'No content'}
              </p>
              <span className="text-[11px] text-gray-400 mt-2 block">
                {new Date(note.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
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
    </div>
  );
}
