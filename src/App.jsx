import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Navbar from './components/Navbar'
import NoteCard from './components/NoteCard'
import NoteModal from './components/NoteModal'
import { Plus, Search, Loader2, StickyNote, Sparkles } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) fetchNotes()
  }, [session])

  const fetchNotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error.message)
    } else if (data) {
      setNotes(data)
    }
    setLoading(false)
  }

  const handleSaveNote = async ({ title, content, category }) => {
    if (editingNote) {
      const { error } = await supabase
        .from('notes')
        .update({ title, content, category, updated_at: new Date() })
        .eq('id', editingNote.id)

      if (error) alert(error.message)
      else fetchNotes()
    } else {
      const { error } = await supabase
        .from('notes')
        .insert([{ title, content, category, user_id: session.user.id }])

      if (error) alert(error.message)
      else fetchNotes()
    }
    setIsModalOpen(false)
    setEditingNote(null)
  }

  const handleTogglePin = async (note) => {
    const { error } = await supabase
      .from('notes')
      .update({ is_pinned: !note.is_pinned })
      .eq('id', note.id)

    if (!error) fetchNotes()
  }

  const handleDeleteNote = async (id) => {
    if (window.confirm('Delete this note permanently?')) {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (!error) setNotes(notes.filter((n) => n.id !== id))
      else alert(error.message)
    }
  }

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-900">
      <Navbar user={session?.user} />

      {!session ? (
        <Auth />
      ) : (
        <main className="max-w-6xl mx-auto px-4 pt-8">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {['all', 'work', 'personal', 'ideas', 'todo'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(noteToEdit) => { setEditingNote(noteToEdit); setIsModalOpen(true); }}
                  onDelete={handleDeleteNote}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-800/30 border border-slate-800 rounded-3xl max-w-md mx-auto">
              <StickyNote className="w-12 h-12 text-indigo-400/50 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-200">No notes found</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">Create your first note to store it safely in the cloud.</p>
              <button
                onClick={() => { setEditingNote(null); setIsModalOpen(true); }}
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Note</span>
              </button>
            </div>
          )}

          {/* Floating Create Button */}
          <button
            onClick={() => { setEditingNote(null); setIsModalOpen(true); }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center z-40"
          >
            <Plus className="w-6 h-6" />
          </button>

          <NoteModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveNote}
            activeNote={editingNote}
          />
        </main>
      )}
    </div>
  )
}
