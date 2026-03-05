import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
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
            Transforme uma ideia em{' '}
            <span className="text-orange-600">pesquisa, posts, roteiros e newsletters</span>{' '}
            automaticamente.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Crie uma máquina de conteúdo omnichannel a partir de uma única ideia. Tudo calibrado com a alma da sua marca.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-orange-600/20 transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            Criar minha fábrica de conteúdo grátis
          </Link>
        </div>
      </section>

      {/* ========== 2. SCREENSHOT MOCKUP ========== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-10">
            Veja a ferramenta em ação
          </h2>
          <div className="bg-slate-100 rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-inner">
            {/* Mockup da interface */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Produto:</span>
                <span className="text-sm font-semibold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">Curso de Copywriting</span>
              </div>
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center px-4 text-slate-400 text-sm">
                    Digite o tema ou ideia...
                  </div>
                  <div className="h-12 px-6 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center text-sm">
                    Gerar conteúdo
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Estrutura Ebook', 'Posts LinkedIn', 'Roteiros Vídeo', 'Newsletter'].map((label, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
                      <i className={`fas ${['fa-book-open', 'fa-linkedin', 'fa-video', 'fa-envelope'][i]} text-orange-500 text-xl mb-1 block`}></i>
                      <span className="text-xs font-medium text-slate-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 3. EXEMPLO REAL DE OUTPUT ========== */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">
            Exemplo
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Input</p>
              <div className="bg-white rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 font-medium">
                Produto: Curso de Copywriting
              </div>
            </div>
            <p className="text-center text-slate-500 text-sm">↓</p>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Output gerado</p>
              <ul className="bg-white rounded-xl border-2 border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <li className="px-4 py-3 flex items-center gap-3">
                  <i className="fas fa-book-open text-orange-500 w-5"></i>
                  Estrutura de ebook com 10 capítulos
                </li>
                <li className="px-4 py-3 flex items-center gap-3">
                  <i className="fab fa-linkedin text-orange-500 w-5"></i>
                  5 posts LinkedIn
                </li>
                <li className="px-4 py-3 flex items-center gap-3">
                  <i className="fas fa-video text-orange-500 w-5"></i>
                  3 roteiros de vídeo
                </li>
                <li className="px-4 py-3 flex items-center gap-3">
                  <i className="fas fa-envelope text-orange-500 w-5"></i>
                  1 newsletter
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 4. FEATURES (escaneável) ========== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-4">
            O Poder da Content Factory
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
            Diferente das IAs genéricas, a Content Factory aprende seu produto, público e proposta de valor.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <i className="fas fa-bullseye text-orange-600"></i>
                Estratégia primeiro
              </h3>
              <ul className="text-slate-600 text-sm space-y-2">
                <li>• produto</li>
                <li>• público</li>
                <li>• dores</li>
                <li>• proposta de valor</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <i className="fas fa-bolt text-orange-600"></i>
                Omnichannel automático
              </h3>
              <ul className="text-slate-600 text-sm space-y-2">
                <li>• ebook</li>
                <li>• vídeos</li>
                <li>• posts</li>
                <li>• newsletters</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <i className="fas fa-database text-orange-600"></i>
                Memória de marca
              </h3>
              <ul className="text-slate-600 text-sm space-y-2">
                <li>• briefing salvo</li>
                <li>• consistência de tom</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5. TABELA COMPARATIVA ========== */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">
            Content Factory vs IA genérica
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="text-left py-4 px-4 font-bold text-slate-700">Tarefa</th>
                  <th className="text-left py-4 px-4 font-bold text-orange-600">Content Factory</th>
                  <th className="text-left py-4 px-4 font-bold text-slate-500">IA genérica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">Briefing</td>
                  <td className="py-3 px-4 text-slate-700">1 vez</td>
                  <td className="py-3 px-4 text-slate-500">toda vez</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">Conteúdo omnichannel</td>
                  <td className="py-3 px-4 text-slate-700">automático</td>
                  <td className="py-3 px-4 text-slate-500">manual</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">Tom de voz</td>
                  <td className="py-3 px-4 text-slate-700">consistente</td>
                  <td className="py-3 px-4 text-slate-500">variável</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">Organização</td>
                  <td className="py-3 px-4 text-slate-700">centralizada</td>
                  <td className="py-3 px-4 text-slate-500">arquivos soltos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== 6. PROVA SOCIAL ========== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            Mais de 5.000 conteúdos já criados com a Content Factory.
          </p>
          <p className="text-slate-600">
            Produtores e gestores escalando produção sem perder a identidade da marca.
          </p>
        </div>
      </section>

      {/* ========== 7. CTA FINAL + PROMESSA ========== */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-50 to-orange-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            Configure seu produto uma vez e gere conteúdos ilimitados sempre alinhados à sua estratégia.
          </h2>
          <p className="text-slate-600 mb-8">
            Comece gratuitamente. Sem cartão de crédito.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-orange-600/20 transition-all hover:shadow-xl"
          >
            Gerar meus primeiros conteúdos agora
          </Link>
          <p className="mt-6 text-slate-500 text-sm">
            Já tem conta? <Link to="/login" className="text-orange-600 font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
