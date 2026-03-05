<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c72b7aa2-8192-4c05-bfe6-20d1d7fe58ca

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Integração com Supabase (opcional)

Para persistir **produtos** e **histórico de conteúdo gerado** no Supabase:

1. Crie um projeto em [supabase.com](https://supabase.com) e copie a URL e a chave anônima (anon key) em **Settings → API**.
2. Crie um arquivo `.env` na raiz (ou use `.env.local`) com:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_anon_key
   ```
3. No **SQL Editor** do painel Supabase:
   - Execute `supabase/schema.sql` para criar as tabelas `products` e `content_history`.
   - Execute `supabase/rls_auth.sql` para ativar **Auth**: coluna `user_id`, RLS e políticas (cada usuário vê só seus dados).
4. Reinicie o `npm run dev`. O app passa a exigir **login** (Entrar / Criar conta). Com isso:
   - **Carregar** os produtos salvos ao abrir a tela de configuração
   - **Salvar** automaticamente ao editar um produto
   - **Registrar** cada pacote de conteúdo gerado no histórico
   - **Sair** no header para trocar de conta

Sem as variáveis do Supabase, o app continua funcionando só em memória (sem login).

## Deploy (hospedagem)

O Supabase é o **backend** (banco, auth). O frontend (este app) pode ser hospedado em:

### Opção 1: Vercel (recomendado)

1. Faça push do projeto para um repositório GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New Project** → importe o repo.
3. **Antes do primeiro deploy**, em **Environment Variables** defina:
   - `GEMINI_API_KEY` – chave do Gemini (**só no servidor**; usada pela API `/api/generate-content`, não exposta no frontend)
   - `VITE_SUPABASE_URL` – URL do projeto Supabase (ex.: `https://xxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` – chave anônima (publishable) do Supabase
4. Deploy. A Vercel usa o `vercel.json` para SPA (todas as rotas → `index.html`).

**Importante:** Sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente da Vercel, o app **não pede login** e abre direto na Configuração. Defina as duas variáveis e faça **Redeploy** (Deployments → ⋮ → Redeploy) para a tela de login aparecer.

### Opção 2: Netlify

1. Repo no GitHub → [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**.
2. Build command: `npm run build` | Publish directory: `dist`.
3. Em **Site settings → Environment variables** adicione:
   - `GEMINI_API_KEY` – chave do Gemini (usada pela API no servidor; não exposta no frontend)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy (ou **Trigger deploy** depois de salvar as variáveis). O `netlify.toml` já está configurado para SPA.

**Importante:** Sem as variáveis do Supabase, o app não exige login. Configure-as e faça um novo deploy.

### Opção 3: Supabase Storage (apenas para arquivos estáticos)

O Supabase Storage **serve HTML como texto puro** por segurança, então o navegador exibe o código em vez de renderizar o app. Para ver o site funcionando, use **Vercel** ou **Netlify**. O script `npm run deploy:supabase` continua útil para subir assets (ex.: para um bucket de arquivos), mas não para hospedar o frontend completo.

**Nota:** A chave **service role** não deve ser exposta no frontend; use só no script de deploy (local ou CI).
