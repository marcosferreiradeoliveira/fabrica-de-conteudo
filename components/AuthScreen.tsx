import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const signupRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const scrollToSignup = () => {
    signupRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    <div className="min-h-screen bg-slate-50">
      {/* ========== 1. HERO ========== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-slate-50 pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="bg-orange-600 p-2.5 rounded-xl">
              <i className="fas fa-crystal-ball text-white text-2xl"></i>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Content Factory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Chega de sofrer com a folha em branco.{' '}
            <span className="text-orange-600">Transforme uma ideia bruta em uma máquina de conteúdo.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            A Content Factory é a sua fábrica de conteúdo pessoal. Um clique para gerar pesquisa de ebook, roteiros, posts e emails, tudo calibrado com a alma da sua marca.
          </p>
          <button
            type="button"
            onClick={scrollToSignup}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-orange-600/20 transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            Começar minha Fábrica de Conteúdo (Grátis)
          </button>
        </div>
      </section>

      {/* ========== 2. O PODER DO ORÁCULO ========== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-12">
            O Poder da Content Factory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-4">
                <i className="fas fa-bullseye text-xl"></i>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Estratégia Primeiro, Texto Depois</h3>
              <p className="text-slate-600 text-sm">
                Diferente do ChatGPT, a Content Factory conhece seu produto. Configure seu contexto, público, USP e dores. A IA não &quot;chuta&quot;, ela segue o seu manual de marca.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-4">
                <i className="fas fa-bolt text-xl"></i>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Omnichannel em um Clique</h3>
              <p className="text-slate-600 text-sm mb-3">
                Gere simultaneamente:
              </p>
              <ul className="text-slate-600 text-sm text-left space-y-1">
                <li>• Pesquisa para Ebook (estrutura densa)</li>
                <li>• Roteiros de Podcast e Vídeo (com JSON)</li>
                <li>• Posts para Instagram e LinkedIn</li>
                <li>• Newsletters que convertem</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-4">
                <i className="fas fa-database text-xl"></i>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Memória de Marca</h3>
              <p className="text-slate-600 text-sm">
                Seus produtos e histórico ficam salvos. Reutilize estratégias e mantenha a consistência em todas as campanhas, sem precisar repetir o briefing toda vez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 3. TABELA DE COMPARAÇÃO ========== */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">
            Content Factory vs jeito tradicional
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="text-left py-4 px-4 font-bold text-slate-700">Tarefa</th>
                  <th className="text-left py-4 px-4 font-bold text-orange-600">Na Content Factory</th>
                  <th className="text-left py-4 px-4 font-bold text-slate-500">No jeito tradicional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">Brainstorming</td>
                  <td className="py-3 px-4 text-slate-700">Instantâneo e guiado</td>
                  <td className="py-3 px-4 text-slate-500">Horas de bloqueio criativo</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">Adaptação de canal</td>
                  <td className="py-3 px-4 text-slate-700">Automática (um clique)</td>
                  <td className="py-3 px-4 text-slate-500">Manual (post por post)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">Tom de voz</td>
                  <td className="py-3 px-4 text-slate-700">Configurado e fixo</td>
                  <td className="py-3 px-4 text-slate-500">Oscila conforme o humor</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">Organização</td>
                  <td className="py-3 px-4 text-slate-700">Centralizada por produto</td>
                  <td className="py-3 px-4 text-slate-500">Arquivos espalhados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== 4. CADASTRO (social proof + form) ========== */}
      <section ref={signupRef} className="py-16 px-4 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Lado esquerdo: social proof */}
            <div className="lg:sticky lg:top-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                Junte-se a produtores e gestores que escalaram sua produção em 10x sem perder a identidade.
              </h2>
              <p className="text-slate-600 mb-6">
                Configure seu primeiro produto em menos de 1 minuto e comece a gerar conteúdo alinhado à sua marca hoje.
              </p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-orange-600"></i>
                  Acesso à fábrica de conteúdo
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-orange-600"></i>
                  Produtos e histórico salvos
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-orange-600"></i>
                  Sem cartão de crédito
                </li>
              </ul>
            </div>

            {/* Lado direito: formulário */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <i className="fas fa-crystal-ball text-white"></i>
                </div>
                <span className="font-bold text-slate-800">CONTENT FACTORY</span>
              </div>
              <div className="flex gap-2 mb-6 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    mode === 'signin' ? 'bg-white text-slate-900 border border-b-0 border-slate-200 -mb-px' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    mode === 'signup' ? 'bg-white text-slate-900 border border-b-0 border-slate-200 -mb-px' : 'text-slate-500 hover:text-slate-700'
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
                <p className="text-center text-slate-500 text-xs">
                  Leva menos de 1 minuto para configurar seu primeiro produto.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
