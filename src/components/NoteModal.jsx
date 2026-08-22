import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function NoteModal({ isOpen, onClose, onSave, activeNote }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title || '')
      setContent(activeNote.content || '')
      setCategory(activeNote.category || 'general')
    } else {
      setTitle('')
      setContent('')
      setCategory('general')
    }
  }, [activeNote, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title, content, category })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-white">{activeNote ? 'Edit Note' : 'Create New Note'}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Note Title..."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-base font-medium placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {['general', 'work', 'personal', 'ideas', 'todo'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${category === cat ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              placeholder="Write your note here..."
              rows="5"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 resize-none text-sm placeholder-slate-500"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-medium transition text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition text-white shadow-lg shadow-indigo-600/20"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
