import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ensureDB } from './db.js';
import ingestRouter from './routes/ingest.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure DB and tables exist
ensureDB();

// Routes
app.use('/api', ingestRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
  console.log(`Vaultly API escuchando en http://localhost:${PORT}`);
});
