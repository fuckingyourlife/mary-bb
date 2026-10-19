import { MongoClient } from 'mongodb';
import { STORY_IDS } from '../story-ids.js';

const COLLECTION_ID = 'mary-shared-reading-progress';
let mongoClientPromise;

function json(body, status = 200, extraHeaders = new Headers()) {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

function getMongoClient() {
  if (!mongoClientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not configured');
    mongoClientPromise = new MongoClient(uri, { maxPoolSize: 5 }).connect();
  }
  return mongoClientPromise;
}

export default {
  async fetch(request) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean);
    const origin = request.headers.get('origin');
    const corsHeaders = new Headers({
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });

    if (!origin || !allowedOrigins.includes(origin)) return json({ error: 'Origin not allowed' }, 403, corsHeaders);
    corsHeaders.set('Access-Control-Allow-Origin', origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed' }, 405, corsHeaders);

    if (!process.env.MONGODB_URI) return json({ error: 'Banco de dados não configurado' }, 503, corsHeaders);

    try {
      const client = await getMongoClient();
      const database = client.db(process.env.MONGODB_DB || 'sonhos_da_mary');
      const progress = database.collection('reading_progress');

      if (request.method === 'GET') {
        const record = await progress.findOne({ _id: COLLECTION_ID }, { projection: { _id: 0, storyIds: 1 } });
        return json({ storyIds: (record?.storyIds || []).filter(id => STORY_IDS.has(id)) }, 200, corsHeaders);
      }

      const body = await request.json().catch(() => null);
      const storyIds = Array.isArray(body?.storyIds) ? body.storyIds : [];
      const validIds = [...new Set(storyIds.filter(id => typeof id === 'string' && STORY_IDS.has(id)))];
      if (validIds.length !== storyIds.length || validIds.length === 0) return json({ error: 'Lista de histórias inválida' }, 400, corsHeaders);

      await progress.updateOne(
        { _id: COLLECTION_ID },
        { $addToSet: { storyIds: { $each: validIds } }, $set: { updatedAt: new Date() } },
        { upsert: true },
      );
      return json({ ok: true }, 200, corsHeaders);
    } catch (error) {
      console.error('Reading progress API failed:', error);
      return json({ error: 'Não foi possível acessar o banco de dados' }, 500, corsHeaders);
    }
  },
};
