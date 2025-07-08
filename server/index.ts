import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Webhook endpoint FIRST - before any other middleware
app.post('/api/webhook/email', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('Mailgun webhook received:', req.body);
    
    // Import here to avoid circular dependency
    const { emailForwardingService } = await import("./emailForwarding");
    
    const incomingEmail = {
      to: req.body.recipient || req.body.to,
      from: req.body.sender || req.body.from,
      subject: req.body.subject || 'No Subject',
      html: req.body['body-html'] || req.body.html,
      text: req.body['body-plain'] || req.body.text,
      headers: {},
      attachments: []
    };

    const forwarded = await emailForwardingService.forwardEmail(incomingEmail);
    
    res.status(200).json({ 
      status: forwarded ? 'forwarded' : 'ignored', 
      message: forwarded ? 'Email successfully forwarded' : 'No matching alias' 
    });
      
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
