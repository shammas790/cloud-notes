import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { User } from 'lucide-react'

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage({ type: 'success', text: 'Account created! You can now log in.' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-2 text-slate-400">Or</span>
          </div>
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 transition font-medium py-2.5 rounded-lg text-slate-200 disabled:opacity-50"
        >
          <User className="w-4 h-4" />
          <span>Continue as Guest</span>
        </button>

        <p className="text-sm text-center text-slate-400 mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage({ type: '', text: '' }); }}
            className="text-indigo-400 hover:underline font-medium"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
