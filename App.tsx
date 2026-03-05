import React, { useState, useEffect } from 'react';
import { generateContentPackage } from './services/geminiService';
import { GenerationState, ContentConfig, PlatformConfig, Product } from './types';
import { isSupabaseConfigured } from './lib/supabase';
import { listProducts, saveProduct, saveContentPackage, listContentHistory } from './services/supabaseService';
import type { ContentPackage } from './types';
import { useAuth } from './context/AuthContext';
import ResultCard from './components/ResultCard';
import AuthScreen from './components/AuthScreen';

type PlatformKey = Exclude<keyof Product, 'id' | 'name' | 'productContext' | 'targetAudience' | 'usp' | 'painPoints' | 'restrictions' | 'contentPillar'>;

const initialProduct: Product = {
  id: 'default',
  name: 'Produto Padrão',
  productContext: 'Consultoria em Gestão Cultural',
  targetAudience: 'Produtores culturais e gestores de projetos criativos',
  usp: 'Metodologia exclusiva de aprovação em editais',
  painPoints: 'Burocracia excessiva, falta de tempo, medo de glosa',
  restrictions: 'Não citar concorrentes diretos, evitar termos jurídicos complexos',
  contentPillar: 'Autoridade e Educação',
  ebook: { tone: 'Técnico e Profundo', format: 'Estrutura de Capítulos', styleReferences: 'Minimalista e direto', campaignGoal: 'Geração de Leads' },
  podcast: { tone: 'Descontraído', format: 'Roteiro de Entrevista', styleReferences: 'NPR Style', campaignGoal: 'Conexão e Branding', scriptStructure: 'Entrevista com especialista' },
  video: { tone: 'Humorístico', format: 'Reels de 15s', styleReferences: 'Dinâmico com cortes rápidos', campaignGoal: 'Viralização', hook: 'Você está perdendo dinheiro?' },
  instagram: { tone: 'Inspiracional', format: 'Carrossel', styleReferences: 'Visual clean', campaignGoal: 'Engajamento', hashtags: '#gestaocultural #leisdeincentivo' },
  linkedin: { tone: 'Profissional', format: 'Artigo de Opinião', styleReferences: 'Corporativo moderno', campaignGoal: 'Autoridade', cta: 'Comente sua experiência' },
  email: { tone: 'Pessoal', format: 'Newsletter Curta', styleReferences: 'Storytelling pessoal', campaignGoal: 'Venda direta', subjectLine: 'Um segredo sobre aprovação' },
};

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [step, setStep] = useState<'config' | 'main'>('config');
  const [idea, setIdea] = useState('');
  const [products, setProducts] = useState<Product[]>([initialProduct]);
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct.id);
  const [state, setState] = useState<GenerationState>({
    loading: false,
    error: null,
    content: null,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showNameInputForProductId, setShowNameInputForProductId] = useState<string | null>(null);
  const [newProductNameDraft, setNewProductNameDraft] = useState('');
  type HistoryItem = { id: string; idea: string; product_id: string; product_name: string; content: ContentPackage; created_at: string };
  const [contentHistory, setContentHistory] = useState<HistoryItem[]>([]);
  const [contentHistoryLoading, setContentHistoryLoading] = useState(false);

  const loadSavedIdea = (item: HistoryItem) => {
    setIdea(item.idea);
    setSelectedProductId(item.product_id);
    setState((prev) => ({ ...prev, content: item.content, error: null }));
  };

  // Carrega produtos do Supabase ao montar (se configurado e logado)
  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return;
    listProducts().then(({ data, error }) => {
      if (error) {
        console.warn('Supabase listProducts:', error);
        return;
      }
      if (data && data.length > 0) {
        setProducts(data);
        setSelectedProductId(data[0].id);
      }
    });
  }, [user]);

  // Carrega histórico de ideias na tela da ideia (por produto)
  useEffect(() => {
    if (!isSupabaseConfigured() || step !== 'main') return;
    setContentHistoryLoading(true);
    listContentHistory(100).then(({ data, error }) => {
      setContentHistoryLoading(false);
      if (!error && data) setContentHistory(data);
    });
  }, [step, state.content]);

  // Com Supabase configurado: exige login; sem Supabase segue sem auth
  if (isSupabaseConfigured()) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <i className="fas fa-circle-notch fa-spin text-4xl text-orange-600"></i>
        </div>
      );
    }
    if (!user) {
      return <AuthScreen />;
    }
  }

  // Helper to get current product (após os returns, mesma quantidade de hooks sempre)
  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    if (isSupabaseConfigured()) {
      saveProduct(updatedProduct).catch((err) => console.warn('Supabase saveProduct:', err));
    }
  };

  const createNewProduct = () => {
    const newProduct: Product = {
      ...initialProduct,
      id: Date.now().toString(),
      name: 'Novo Produto',
      productContext: '',
      targetAudience: '',
      usp: '',
      painPoints: '',
      restrictions: '',
      contentPillar: ''
    };
    setProducts(prev => [...prev, newProduct]);
    setSelectedProductId(newProduct.id);
    setShowNameInputForProductId(newProduct.id);
    setNewProductNameDraft('Novo Produto');
  };

  const handleSaveProduct = async () => {
    if (!isSupabaseConfigured()) return;
    setSaveStatus('saving');
    let productToSave = products.find(p => p.id === selectedProductId) || currentProduct;
    if (showNameInputForProductId === selectedProductId && newProductNameDraft.trim()) {
      productToSave = { ...productToSave, name: newProductNameDraft.trim() };
      setProducts(prev => prev.map(p => p.id === selectedProductId ? productToSave : p));
      setShowNameInputForProductId(null);
    }
    const { error } = await saveProduct(productToSave);
    if (error) {
      setSaveStatus('error');
      return;
    }
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleConfigChange = (platform: PlatformKey, field: keyof PlatformConfig, value: string) => {
    const updatedProduct = {
      ...currentProduct,
      [platform]: {
        ...currentProduct[platform],
        [field]: value
      }
    };
    updateProduct(updatedProduct);
  };

  const handleContextChange = (field: keyof Product, value: string) => {
    const updatedProduct = {
      ...currentProduct,
      [field]: value
    };
    updateProduct(updatedProduct);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setState({ loading: true, error: null, content: null });
    try {
      const result = await generateContentPackage(idea, currentProduct);
      setState({ loading: false, error: null, content: result });
      if (isSupabaseConfigured()) {
        saveContentPackage(idea, currentProduct.id, currentProduct.name, result).catch((err) =>
          console.warn('Supabase saveContentPackage:', err)
        );
      }
    } catch (err: any) {
      setState({ loading: false, error: err.message, content: null });
    }
  };

  const platforms: { key: PlatformKey; label: string; icon: string }[] = [
    { key: 'ebook', label: 'Ebook', icon: 'fa-book-open' },
    { key: 'podcast', label: 'Podcast', icon: 'fa-microphone-lines' },
    { key: 'video', label: 'Vídeo', icon: 'fa-video' },
    { key: 'instagram', label: 'Instagram', icon: 'fa-instagram' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'fa-linkedin' },
    { key: 'email', label: 'Email Mkt', icon: 'fa-envelope' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('config')}>
            <div className="bg-orange-600 p-2 rounded-lg">
              <i className="fas fa-crystal-ball text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ORÁCULO <span className="text-orange-600">CULTURAL</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Content Factory v2.0</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => setStep('main')}
              className={`text-sm font-medium flex items-center gap-2 ${
                step === 'main' ? 'text-orange-600 font-semibold' : 'text-slate-600 hover:text-orange-600'
              }`}
              title="Ir para o gerador de ideias"
            >
              <i className="fas fa-lightbulb"></i> Gerador de ideias
            </button>
            <button
              onClick={() => setStep('config')}
              className={`text-sm font-medium flex items-center gap-2 ${
                step === 'config' ? 'text-orange-600 font-semibold' : 'text-slate-600 hover:text-orange-600'
              }`}
              title="Configuração da fábrica"
            >
              <i className="fas fa-cog"></i> Configurar
            </button>
            {isSupabaseConfigured() && user && (
              <div className="flex items-center gap-3 pl-4 ml-2 border-l border-slate-200">
                <span className="text-sm text-slate-500 truncate max-w-[180px]" title={user.email}>
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 flex items-center gap-1.5"
                  title="Sair"
                >
                  <i className="fas fa-sign-out-alt"></i> Sair
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {step === 'config' ? (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Configuração da Fábrica</h2>
              <p className="text-slate-600">Gerencie seus produtos e defina a estratégia de conteúdo.</p>
            </div>

            {/* Product Selector */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <i className="fas fa-cube"></i>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Produto Selecionado
                  </label>
                  <select 
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setShowNameInputForProductId(null);
                    }}
                    className="w-full md:w-64 bg-transparent font-bold text-slate-900 outline-none cursor-pointer border-b border-dashed border-slate-300 hover:border-orange-500 transition-colors py-1"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {showNameInputForProductId === p.id ? 'Novo produto' : p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                {showNameInputForProductId === selectedProductId && (
                  <input 
                    type="text" 
                    value={newProductNameDraft}
                    onChange={(e) => setNewProductNameDraft(e.target.value)}
                    placeholder="Nome do novo produto"
                    className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                  />
                )}
                {isSupabaseConfigured() && (
                  <button
                    type="button"
                    onClick={handleSaveProduct}
                    disabled={saveStatus === 'saving'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                      saveStatus === 'saved'
                        ? 'bg-green-600 text-white'
                        : saveStatus === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-slate-300'
                    }`}
                  >
                    {saveStatus === 'saving' && <i className="fas fa-circle-notch fa-spin"></i>}
                    {saveStatus === 'saved' && <i className="fas fa-check"></i>}
                    {saveStatus === 'error' && <i className="fas fa-exclamation-circle"></i>}
                    {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo!' : saveStatus === 'error' ? 'Erro ao salvar' : 'Salvar produto'}
                  </button>
                )}
                <button 
                  onClick={createNewProduct}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <i className="fas fa-plus"></i> Novo
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <i className="fas fa-bullseye"></i>
                </div>
                <h3 className="font-bold text-slate-800">Contexto Estratégico da Marca</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Contexto do Produto (O que você vende?)
                  </label>
                  <input 
                    type="text" 
                    value={currentProduct.productContext}
                    onChange={(e) => handleContextChange('productContext', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm shadow-sm"
                    placeholder="Ex: Consultoria, Curso Online..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Público-Alvo (Para quem?)
                  </label>
                  <input 
                    type="text" 
                    value={currentProduct.targetAudience}
                    onChange={(e) => handleContextChange('targetAudience', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm shadow-sm"
                    placeholder="Ex: Produtores culturais, Advogados..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Diferenciais Competitivos (USP)
                  </label>
                  <textarea 
                    value={currentProduct.usp}
                    onChange={(e) => handleContextChange('usp', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm shadow-sm h-24 resize-none"
                    placeholder="O que torna seu produto único? Ex: Atendimento 24h, Metodologia exclusiva..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Problemas/Dores que resolve
                  </label>
                  <textarea 
                    value={currentProduct.painPoints}
                    onChange={(e) => handleContextChange('painPoints', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm shadow-sm h-24 resize-none"
                    placeholder="Liste 3 problemas principais. Ex: Falta de tempo, burocracia..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Restrições (O que NÃO dizer)
                  </label>
                  <input 
                    type="text" 
                    value={currentProduct.restrictions}
                    onChange={(e) => handleContextChange('restrictions', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm shadow-sm"
                    placeholder="Palavras banidas, concorrentes..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Pilar de Conteúdo / Editoria
                  </label>
                  <input 
                    type="text" 
                    value={currentProduct.contentPillar}
                    onChange={(e) => handleContextChange('contentPillar', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm shadow-sm"
                    placeholder="Ex: Autoridade, Venda, Conexão, Bastidores..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {platforms.map((platform) => (
                <div key={platform.key} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <i className={`fab ${platform.icon.replace('fa-', '')} fas ${platform.icon}`}></i>
                    </div>
                    <h3 className="font-bold text-slate-800">{platform.label}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tom de Voz</label>
                        <input 
                          type="text" 
                          value={currentProduct[platform.key].tone}
                          onChange={(e) => handleConfigChange(platform.key, 'tone', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-xs"
                          placeholder="Ex: Divertido..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Formato</label>
                        <input 
                          type="text" 
                          value={currentProduct[platform.key].format}
                          onChange={(e) => handleConfigChange(platform.key, 'format', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-xs"
                          placeholder="Ex: Lista..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ref. Estilo</label>
                        <input 
                          type="text" 
                          value={currentProduct[platform.key].styleReferences}
                          onChange={(e) => handleConfigChange(platform.key, 'styleReferences', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-xs"
                          placeholder="Ex: Minimalista..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Objetivo</label>
                        <input 
                          type="text" 
                          value={currentProduct[platform.key].campaignGoal}
                          onChange={(e) => handleConfigChange(platform.key, 'campaignGoal', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-xs"
                          placeholder="Ex: Venda..."
                        />
                      </div>
                    </div>

                    {/* Platform Specific Fields */}
                    {platform.key === 'instagram' && (
                      <div>
                        <label className="block text-[10px] font-bold text-pink-600 uppercase tracking-wider mb-1">Hashtags / Keywords</label>
                        <input 
                          type="text" 
                          value={currentProduct.instagram.hashtags || ''}
                          onChange={(e) => handleConfigChange('instagram', 'hashtags', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-pink-100 bg-pink-50 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-xs"
                          placeholder="#exemplo #marketing"
                        />
                      </div>
                    )}

                    {platform.key === 'linkedin' && (
                      <div>
                        <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Call to Action (CTA)</label>
                        <input 
                          type="text" 
                          value={currentProduct.linkedin.cta || ''}
                          onChange={(e) => handleConfigChange('linkedin', 'cta', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs"
                          placeholder="Ex: Comente abaixo..."
                        />
                      </div>
                    )}

                    {platform.key === 'email' && (
                      <div>
                        <label className="block text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1">Linha de Assunto (Estilo)</label>
                        <input 
                          type="text" 
                          value={currentProduct.email.subjectLine || ''}
                          onChange={(e) => handleConfigChange('email', 'subjectLine', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-yellow-100 bg-yellow-50 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 outline-none text-xs"
                          placeholder="Ex: Curioso, Urgente..."
                        />
                      </div>
                    )}

                    {platform.key === 'video' && (
                      <div>
                        <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Hook (Gancho - 3s)</label>
                        <input 
                          type="text" 
                          value={currentProduct.video.hook || ''}
                          onChange={(e) => handleConfigChange('video', 'hook', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-purple-100 bg-purple-50 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
                          placeholder="Como prender a atenção?"
                        />
                      </div>
                    )}

                    {platform.key === 'podcast' && (
                      <div>
                        <label className="block text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Estrutura de Roteiro</label>
                        <input 
                          type="text" 
                          value={currentProduct.podcast.scriptStructure || ''}
                          onChange={(e) => handleConfigChange('podcast', 'scriptStructure', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-red-100 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-xs"
                          placeholder="Ex: Entrevista, Monólogo..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              {isSupabaseConfigured() && (
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={saveStatus === 'saving'}
                  className={`font-bold py-4 px-8 rounded-2xl transition-all shadow-lg flex items-center gap-3 text-lg ${
                    saveStatus === 'saved'
                      ? 'bg-green-600 text-white'
                      : saveStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-slate-300'
                  }`}
                >
                  {saveStatus === 'saving' && <i className="fas fa-circle-notch fa-spin"></i>}
                  {saveStatus === 'saved' && <i className="fas fa-check"></i>}
                  {saveStatus === 'error' && <i className="fas fa-exclamation-circle"></i>}
                  {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo!' : saveStatus === 'error' ? 'Erro ao salvar' : 'Salvar produto'}
                </button>
              )}
              <button 
                onClick={() => setStep('main')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg flex items-center gap-3 text-lg"
              >
                Próximo: Definir Ideia <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Input Section */}
            <div className="max-w-3xl mx-auto mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium mb-6 cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => setStep('config')}>
                <i className="fas fa-sliders-h"></i> Configurações personalizadas ativas
              </div>
              
              <h2 className="text-4xl font-black text-slate-900 mb-4 leading-tight">
                Transforme sua <span className="text-orange-600 italic">ideia bruta</span> em uma máquina de conteúdo.
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Dê o tema, e o Oráculo gera pesquisa para ebook, roteiro de podcast, corte de vídeo em JSON, posts e o email perfeito.
              </p>

              <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Produto:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 max-w-md px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 font-medium bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <form onSubmit={handleGenerate} className="relative">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ex: Gestão cultural com IA ou Leis de Incentivo 2024..."
                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-lg shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={state.loading || !idea}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3 text-lg"
                  >
                    {state.loading ? (
                      <><i className="fas fa-circle-notch fa-spin"></i> Gerando...</>
                    ) : (
                      <><i className="fas fa-bolt"></i> Fabricar Conteúdo</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Seção: Ideias salvas por produto */}
            {isSupabaseConfigured() && (
              <section className="mb-16 py-8 px-4 bg-slate-100/80 border-y border-slate-200">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-history text-orange-600"></i> Ideias salvas por produto
                  </h2>
                  {contentHistoryLoading ? (
                    <p className="text-slate-500 text-sm flex items-center gap-2"><i className="fas fa-circle-notch fa-spin"></i> Carregando...</p>
                  ) : contentHistory.length === 0 ? (
                    <p className="text-slate-500 text-sm">Nenhuma ideia salva ainda. Gere um conteúdo para ver aqui.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(
                        contentHistory.reduce<Record<string, HistoryItem[]>>((acc, item) => {
                          const key = item.product_name || 'Sem produto';
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(item);
                          return acc;
                        }, {})
                      ).map(([productName, items]) => (
                        <div key={productName} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="px-4 py-2.5 bg-slate-200/60 border-b border-slate-200 font-semibold text-slate-800 text-sm">
                            {productName}
                          </div>
                          <ul className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                            {items.map((item) => (
                              <li key={item.id}>
                                <button
                                  type="button"
                                  onClick={() => loadSavedIdea(item)}
                                  className="w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors flex items-center justify-between gap-2 group text-sm"
                                >
                                  <span className="text-slate-700 truncate group-hover:text-orange-600">{item.idea}</span>
                                  <span className="text-slate-400 text-xs whitespace-nowrap">
                                    {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Results Section */}
            {state.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 text-red-700 flex items-center gap-3">
                <i className="fas fa-exclamation-circle text-xl"></i>
                <p className="font-medium">{state.error}</p>
              </div>
            )}

            {state.content && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Ebook Research */}
                <div className="lg:col-span-2">
                  <ResultCard 
                    title="Pesquisa para Ebook" 
                    icon="fa-book-open" 
                    content={state.content.ebookResearch} 
                  />
                </div>

                {/* Podcast Script */}
                <ResultCard 
                  title="Roteiro de Podcast" 
                  icon="fa-microphone-lines" 
                  content={
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-4">{state.content.podcastScript.title}</h4>
                      <div className="mb-6 italic text-slate-500 bg-slate-50 p-4 rounded-lg border-l-4 border-slate-200">
                        <strong>Intro:</strong> {state.content.podcastScript.introduction}
                      </div>
                      <div className="space-y-6">
                        {state.content.podcastScript.segments.map((seg, idx) => (
                          <div key={idx}>
                            <h5 className="font-bold text-orange-600 mb-2 uppercase text-xs tracking-wider">Bloco {idx + 1}: {seg.title}</h5>
                            <p className="text-sm leading-relaxed">{seg.notes}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-100 font-medium text-slate-500">
                        <strong>Conclusão:</strong> {state.content.podcastScript.conclusion}
                      </div>
                    </div>
                  }
                  rawText={`${state.content.podcastScript.title}\n\nIntro: ${state.content.podcastScript.introduction}\n\n${state.content.podcastScript.segments.map(s => `${s.title}: ${s.notes}`).join('\n\n')}\n\nConclusão: ${state.content.podcastScript.conclusion}`}
                />

                {/* Video Script JSON */}
                <ResultCard 
                  title="Script JSON (Corte de Vídeo IA)" 
                  icon="fa-code" 
                  content={
                    <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                      {state.content.videoScriptJson}
                    </pre>
                  }
                  rawText={state.content.videoScriptJson}
                />

                {/* Social Media */}
                <ResultCard 
                  title="Social Media (Insta & LinkedIn)" 
                  icon="fa-share-nodes" 
                  content={
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <i className="fab fa-instagram text-pink-600 text-xl"></i>
                          <span className="font-bold text-sm text-slate-700">Instagram</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                          {state.content.socialMedia.instagram}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <i className="fab fa-linkedin text-blue-600 text-xl"></i>
                          <span className="font-bold text-sm text-slate-700">LinkedIn</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                          {state.content.socialMedia.linkedin}
                        </div>
                      </div>
                    </div>
                  }
                  rawText={`INSTAGRAM:\n${state.content.socialMedia.instagram}\n\nLINKEDIN:\n${state.content.socialMedia.linkedin}`}
                />

                {/* Email Marketing */}
                <ResultCard 
                  title="Email Marketing (Oráculo Style)" 
                  icon="fa-envelope-open-text" 
                  content={
                    <div className="bg-orange-50/50 p-6 rounded-2xl border-2 border-orange-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl rotate-12">
                        <i className="fas fa-quote-right"></i>
                      </div>
                      <div className="prose prose-slate max-w-none text-slate-800 italic">
                        {state.content.emailMarketing}
                      </div>
                    </div>
                  }
                  rawText={state.content.emailMarketing}
                />
              </div>
            )}

            {/* Placeholder when empty */}
            {!state.content && !state.loading && !state.error && (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale pointer-events-none">
                <i className="fas fa-rocket text-8xl text-slate-200 mb-6"></i>
                <p className="text-xl font-medium text-slate-400">Aguardando seu input para fabricar conteúdo...</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            Desenvolvido com <i className="fas fa-heart text-orange-600"></i> para o Oráculo Cultural.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
