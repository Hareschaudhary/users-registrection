const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 5;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;

const app = express();

// Only enable behind a tunnel / reverse proxy, so req.ip is the real client IP.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY));

app.use(express.json({ limit: '10kb' }));

// Logger: runs first so that rate-limited (429) requests are logged too.
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(
      `[${new Date().toISOString()}] ip=${req.ip} path=${req.originalUrl} status=${res.statusCode}`
    );
  });
  next();
});

// Rate limiter: default behaviour, counted per client IP (req.ip).
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: 'Too Many Requests',
      message: `Limit of ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW_MS / 1000}s exceeded for IP ${req.ip}.`,
      clientIp: req.ip,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    });
  },
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/api/data', limiter, (req, res) => {
  const requestId = crypto.randomUUID();
  res.set('X-Request-Id', requestId);
  res.json({
    message: 'Hello from the backend!',
    requestId,
    timestamp: new Date().toISOString(),
    clientIp: req.ip,
  });
});

app.use('/api/users', limiter, userRoutes);

// 404 for unknown routes
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Central error handler
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Bad Request', message: 'Body is not valid JSON' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = { app, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS };
