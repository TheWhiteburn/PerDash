import pg from 'pg';

export default async function handler(req, res) {
  const projectRef = 'nisidugiacjakhblmwip';
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pool = new pg.Pool({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: secret,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();

    const before = await client.query(`SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND relkind = 'r'`);

    await client.query('ALTER TABLE public.banned_emails ENABLE ROW LEVEL SECURITY');

    const after = await client.query(`SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND relkind = 'r'`);

    client.release();
    await pool.end();

    res.json({
      success: true,
      rls_before: before.rows,
      rls_after: after.rows,
    });
  } catch (e) {
    await pool.end().catch(() => {});
    res.status(500).json({ error: e.message, code: e.code });
  }
}
