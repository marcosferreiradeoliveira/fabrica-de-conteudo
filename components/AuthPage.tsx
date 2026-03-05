import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>(location.pathname === '/signup' ? 'signup' : 'signin');
  useEffect(() => {
    setMode(location.pathname === '/signup' ? 'signup' : 'signin');
    setError(null);
    setMessage(null);
  }, [location.pathname]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim() || !password) {
      setError('Preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUp(email.trim(), password);
        if (error) setError(error.message);
        else setMessage('Conta criada. Confira seu email para confirmar (se o Supabase tiver confirmação ativa).');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="absolute top-6 left-6 text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-2">
        <i className="fas fa-arrow-left"></i> Voltar à home
      </Link>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-orange-600 p-3 rounded-xl">
            <i className="fas fa-crystal-ball text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              CONTENT <span className="text-orange-600">FACTORY</span>
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fábrica de conteúdo</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
          <div className="flex gap-2 mb-6 border-b border-slate-100">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                mode === 'signin' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                mode === 'signup' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-100 text-green-800 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <i className="fas fa-check-circle"></i>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><i className="fas fa-circle-notch fa-spin"></i> Aguarde...</>
              ) : mode === 'signin' ? (
                'Entrar'
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-xs mt-4">
            Leva menos de 1 minuto para configurar seu primeiro produto.
          </p>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          {mode === 'signin' ? (
            <>Não tem conta? <Link to="/signup" className="text-orange-600 font-medium hover:underline">Criar conta</Link></>
          ) : (
            <>Já tem conta? <Link to="/login" className="text-orange-600 font-medium hover:underline">Entrar</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
