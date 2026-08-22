import { supabase } from '../supabaseClient'
import { LogOut, BookOpen } from 'lucide-react'

export default function Navbar({ user }) {
  return (
    <nav className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <span className="text-white">CloudNotes</span>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-xs sm:text-sm text-slate-400 truncate max-w-[150px] sm:max-w-none">
              {user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center space-x-1 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
