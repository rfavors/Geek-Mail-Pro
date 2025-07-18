console.log("ENV VARS:", process.env);
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Production security middleware
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https:"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        childSrc: ["'none'"],
        workerSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"]
      }
    }
  }));
  
  app.use(compression());
  
  app.use(cors({
    origin: process.env.REPLIT_DOMAINS?.split(',') || ['localhost:5000'],
    credentials: true
  }));
}

// Health check for webhook accessibility
app.get('/api/webhook/email', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Webhook endpoint is accessible and ready to receive emails'
  });
});

// Webhook endpoint - completely isolated from middleware  
app.use('/api/webhook/email', (req, res, next) => {
  // Skip all other middleware for this route
  if (req.method === 'POST') {
    // Handle both multipart and urlencoded data from Mailgun
    const multer = require('multer');
    const upload = multer();
    
    upload.any()(req, res, async (err) => {
      if (err) {
        console.log('Multer error, trying urlencoded:', err.message);
        return express.urlencoded({ extended: true })(req, res, async () => {
          await handleWebhook(req, res);
        });
      }
      await handleWebhook(req, res);
    });
  } else {
    next();
  }
});

async function handleWebhook(req: any, res: any) {
  try {
    console.log('=== MAILGUN WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Source: Route Test or Real Email');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('User-Agent:', req.headers['user-agent']);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    // Check if this is a test request with empty body
    if (!req.body || Object.keys(req.body).length === 0) {
      // This is a test POST from Mailgun without real data
      res.status(200).json({ 
        status: 'test', 
        message: 'Webhook endpoint is working! Ready to receive emails.' 
      });
      return;
    }

    // Check if we have required email fields
    const recipient = req.body.recipient || req.body.to;
    if (!recipient) {
      res.status(200).json({ 
        status: 'ignored', 
        message: 'No recipient specified in webhook data' 
      });
      return;
    }
    
    // Import here to avoid circular dependency
    const { emailForwardingService } = await import("./emailForwarding");
    
    const incomingEmail = {
      to: recipient,
      from: req.body.sender || req.body.from || 'unknown@example.com',
      subject: req.body.subject || 'No Subject',
      html: req.body['body-html'] || req.body.html || '',
      text: req.body['body-plain'] || req.body.text || '',
      headers: {},
      attachments: []
    };

    console.log('Processing email for:', incomingEmail.to);

    const forwarded = await emailForwardingService.forwardEmail(incomingEmail);
    
    res.status(200).json({ 
      status: forwarded ? 'forwarded' : 'ignored', 
      message: forwarded ? 'Email successfully forwarded' : 'No matching alias found' 
    });
      
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ error: 'Processing failed', details: error.message });
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize session middleware for custom login
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 3000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
