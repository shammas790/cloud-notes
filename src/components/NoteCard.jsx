import { Edit2, Trash2, Pin } from 'lucide-react'

const categoryColors = {
  work: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  personal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ideas: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  todo: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  general: 'bg-slate-700/50 text-slate-300 border-slate-600/30'
}

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`bg-slate-800/90 backdrop-blur border ${note.is_pinned ? 'border-amber-500/50 shadow-amber-500/5' : 'border-slate-700/80'} hover:border-slate-600 transition-all rounded-2xl p-5 flex flex-col justify-between h-60 shadow-xl relative group`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-white line-clamp-1 flex-1">{note.title}</h3>
          <button
            onClick={() => onTogglePin(note)}
            className={`p-1.5 rounded-lg transition ${note.is_pinned ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'}`}
          >
            <Pin className="w-4 h-4 fill-current" />
          </button>
        </div>
        <p className="text-slate-300 text-sm line-clamp-4 whitespace-pre-wrap leading-relaxed">{note.content}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/60 text-xs">
        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-medium capitalize ${categoryColors[note.category] || categoryColors.general}`}>
          {note.category || 'general'}
        </span>
        <div className="flex items-center space-x-3 text-slate-400">
          <span>{formatDate(note.updated_at)}</span>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
