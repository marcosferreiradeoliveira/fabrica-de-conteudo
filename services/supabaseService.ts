import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product } from '../types';
import type { ContentPackage } from '../types';

const PRODUCTS_TABLE = 'products';
const CONTENT_HISTORY_TABLE = 'content_history';

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Salva ou atualiza um produto. */
export async function saveProduct(product: Product): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: new Error('Supabase não configurado') };
  }
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from(PRODUCTS_TABLE)
    .upsert(
      {
        id: product.id,
        user_id: userId,
        name: product.name,
        product_context: product.productContext,
        target_audience: product.targetAudience,
        usp: product.usp,
        pain_points: product.painPoints,
        restrictions: product.restrictions,
        content_pillar: product.contentPillar,
        platform_config: {
          ebook: product.ebook,
          podcast: product.podcast,
          video: product.video,
          instagram: product.instagram,
          linkedin: product.linkedin,
          email: product.email,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  return { error: error ? new Error(error.message) : null };
}

/** Lista todos os produtos. */
export async function listProducts(): Promise<{ data: Product[] | null; error: Error | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: new Error('Supabase não configurado') };
  }
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) return { data: null, error: new Error(error.message) };
  const products: Product[] = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    productContext: row.product_context ?? '',
    targetAudience: row.target_audience ?? '',
    usp: row.usp ?? '',
    painPoints: row.pain_points ?? '',
    restrictions: row.restrictions ?? '',
    contentPillar: row.content_pillar ?? '',
    ebook: row.platform_config?.ebook ?? { tone: '', format: '', styleReferences: '', campaignGoal: '' },
    podcast: row.platform_config?.podcast ?? { tone: '', format: '', styleReferences: '', campaignGoal: '' },
    video: row.platform_config?.video ?? { tone: '', format: '', styleReferences: '', campaignGoal: '' },
    instagram: row.platform_config?.instagram ?? { tone: '', format: '', styleReferences: '', campaignGoal: '' },
    linkedin: row.platform_config?.linkedin ?? { tone: '', format: '', styleReferences: '', campaignGoal: '' },
    email: row.platform_config?.email ?? { tone: '', format: '', styleReferences: '', campaignGoal: '' },
  }));
  return { data: products, error: null };
}

/** Remove um produto. */
export async function deleteProduct(productId: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: new Error('Supabase não configurado') };
  }
  const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', productId);
  return { error: error ? new Error(error.message) : null };
}

/** Salva um pacote de conteúdo gerado (histórico). */
export async function saveContentPackage(
  idea: string,
  productId: string,
  productName: string,
  content: ContentPackage
): Promise<{ id: string | null; error: Error | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { id: null, error: new Error('Supabase não configurado') };
  }
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from(CONTENT_HISTORY_TABLE)
    .insert({
      idea,
      product_id: productId,
      product_name: productName,
      content_package: content,
      user_id: userId,
    })
    .select('id')
    .single();
  if (error) return { id: null, error: new Error(error.message) };
  return { id: data?.id ?? null, error: null };
}

/** Lista histórico de conteúdos gerados. */
export async function listContentHistory(limit = 20): Promise<{
  data: Array<{ id: string; idea: string; product_id: string; product_name: string; content: ContentPackage; created_at: string }> | null;
  error: Error | null;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: new Error('Supabase não configurado') };
  }
  const { data, error } = await supabase
    .from(CONTENT_HISTORY_TABLE)
    .select('id, idea, product_id, product_name, content_package, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { data: null, error: new Error(error.message) };
  const items = (data || []).map((row: any) => ({
    id: row.id,
    idea: row.idea,
    product_id: row.product_id,
    product_name: row.product_name,
    content: row.content_package as ContentPackage,
    created_at: row.created_at,
  }));
  return { data: items, error: null };
}
