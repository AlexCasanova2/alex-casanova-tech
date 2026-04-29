import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { slug } = req.query;
  
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    
    // Fetch base HTML
    const response = await fetch(`${protocol}://${host}/index.html`);
    let html = await response.text();
    
    // Fetch from DB
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      let query = supabase.from('projects').select('*');
      
      if (/^\d+$/.test(slug)) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }
      
      const { data } = await query.single();
      
      if (data) {
        const title = data.seo_title || data.title;
        const description = data.seo_description || data.description || '';
        const image = data.seo_image || data.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200';
        
        html = html.replace(/<title>.*?<\/title>/, `<title>${title} | Àlex Casanova</title>`);
        html = html.replace(/(property="og:title"\s+content=")([^"]*)(")/gi, `$1${title}$3`);
        html = html.replace(/(property="twitter:title"\s+content=")([^"]*)(")/gi, `$1${title}$3`);
        html = html.replace(/(property="og:description"\s+content=")([^"]*)(")/gi, `$1${description}$3`);
        html = html.replace(/(property="twitter:description"\s+content=")([^"]*)(")/gi, `$1${description}$3`);
        html = html.replace(/(name="description"\s+content=")([^"]*)(")/gi, `$1${description}$3`);
        html = html.replace(/(property="og:image"\s+content=")([^"]*)(")/gi, `$1${image}$3`);
        html = html.replace(/(property="twitter:image"\s+content=")([^"]*)(")/gi, `$1${image}$3`);
      }
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).send(html);
  } catch (err) {
    console.error('SEO Proxy Error:', err);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/"></head><body></body></html>`);
  }
}
