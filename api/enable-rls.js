export default async function handler(req, res) {
  try {
    const projectRef = 'nisidugiacjakhblmwip';
    const oidcToken = process.env.VERCEL_OIDC_TOKEN;

    const oidcRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/vercel-oidc-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oidc_token: oidcToken })
    });

    if (!oidcRes.ok) {
      const errText = await oidcRes.text();
      return res.status(500).json({ error: 'OIDC exchange failed', status: oidcRes.status, detail: JSON.stringify(errText).slice(0, 300) });
    }

    const { access_token } = await oidcRes.json();

    // First check current RLS state
    const checkRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r';` })
    });

    if (!checkRes.ok) {
      return res.status(500).json({ error: 'Query failed', status: checkRes.status, body: await checkRes.text().then(t => t.slice(0, 300)) });
    }

    const before = await checkRes.json();

    // Enable RLS
    const sqlRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'ALTER TABLE public.banned_emails ENABLE ROW LEVEL SECURITY;' })
    });

    if (!sqlRes.ok) {
      const errText = await sqlRes.text();
      return res.status(500).json({ error: 'ALTER TABLE failed', detail: JSON.stringify(errText).slice(0, 500) });
    }

    // Verify
    const verifyRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r';` })
    });

    const after = await verifyRes.json();
    res.json({ success: true, rls_before: before, rls_after: after });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
