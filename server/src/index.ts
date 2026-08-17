import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { issuesRouter } from './routes/issues.js';
import { membersRouter } from './routes/members.js';
import { modulesRouter } from './routes/modules.js';
import { cyclesRouter } from './routes/cycles.js';
import { stagingRouter } from './routes/staging.js';
import { aiRouter } from './routes/ai.js';
import { prisma } from './db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// CORS setup (Allows Vercel frontend and local development)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root route
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>IntelX Platform Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0d0e; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #17181c; border: 1px solid #27272a; padding: 32px; border-radius: 12px; max-width: 480px; text-align: center; }
          h1 { font-size: 20px; margin-bottom: 8px; color: #3f7bf6; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.5; }
          a { display: inline-block; margin-top: 16px; background: #3f7bf6; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 500; font-size: 13px; }
          .links { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
          .secondary { background: #27272a; color: #f4f4f5; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 IntelX Backend API is Running</h1>
          <p>This is the backend REST API server running on port 3001. For the interactive Agile Dashboard UI, open the frontend application.</p>
          <div class="links">
            <a href="http://localhost:5173" target="_blank">Open Agile Dashboard (Port 5173)</a>
            <a href="/api/health" class="secondary">View API Health</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Healthcheck route
app.get('/api/health', async (_req, res) => {
  try {
    const issuesCount = await prisma.issue.count();
    const membersCount = await prisma.member.count();
    res.json({
      status: 'healthy',
      serverTime: new Date().toISOString(),
      database: 'connected',
      stats: {
        totalIssues: issuesCount,
        totalMembers: membersCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// API Routes
app.use('/api/issues', issuesRouter);
app.use('/api/members', membersRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/cycles', cyclesRouter);
app.use('/api/staging', stagingRouter);
app.use('/api/ai', aiRouter);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 IntelX Platform Backend Server running on port ${PORT}`);
  console.log(`📡 Healthcheck available at: http://0.0.0.0:${PORT}/api/health`);
});
