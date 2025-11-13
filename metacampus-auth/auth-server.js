console.log('Starting auth server...');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.set('trust proxy', 1);
app.enable('trust proxy');

// ===== CONFIGURATION =====
const GOOGLE_CLIENT_ID = '*';
const GOOGLE_CLIENT_SECRET = '*';
const CALLBACK_URL = 'https://demo.metacampus.org/auth/google/callback';
const SESSION_SECRET = '*';

// ===== SESSION SETUP =====
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  name: 'metacampus.sid',
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// ===== PASSPORT SETUP =====
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// ===== MIDDLEWARE: Check if user is authenticated =====
function isAuthenticated(req, res, next) {
  
  if (req.isAuthenticated()) {
    return next();
  }
  res.send(`
    <!DOCTYPE html>
	<html lang="en">
	<head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Login - MetaCAMPUS</title>
	  <link rel="preconnect" href="https://fonts.googleapis.com">
	  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
	  <style>
		* {
		  margin: 0;
		  padding: 0;
		  box-sizing: border-box;
		}
		
		body {
		  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		  min-height: 100vh;
		  display: flex;
		  flex-direction: column;
		  background: #white;
		}
		
		/* --- HEADER STYLES (UPDATED) --- */
		.header {
          background: #fffbed;
          border-bottom: 1px solid #d97706;
		  padding: 0.75rem 4rem; /* Reduced padding (py-3 px-4) */
		  display: flex;
		  align-items: center;
		  gap: 0.5rem; /* Reduced gap */
		}
		
		.logo {
		  width: 28px; /* Reduced size to match main app */
		  height: 28px;
		}
		
		.brand {
		  font-size: 1.125rem; /* Reduced font size (text-lg) */
		  font-weight: 700; /* Bolder to stand out slightly */
		  color: #111827;
		}
		
		/* Main Content */
		.main {
		  flex: 1;
		  display: flex;
		  flex-direction: column;
		  align-items: center;
		  justify-content: center;
		  padding: 2rem;
		}
		
		.hero-title {
		  font-size: 3rem;
		  font-weight: 700;
		  color: #111827;
		  text-align: center;
		  margin-bottom: 1rem;
		  line-height: 1.1;
		}
		
		.hero-subtitle {
		  font-size: 1.25rem;
		  color: #6b7280;
		  text-align: center;
		  margin-bottom: 3rem;
		  max-width: 600px;
		}
		
		/* Login Card */
		.login-card {
		  background: white;
		  padding: 3rem;
		  border-radius: 12px;
		  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		  text-align: center;
		  max-width: 420px;
		  width: 100%;
		  border: 1px solid #f3f4f6;
		}
		
		.login-title {
		  font-size: 1.5rem;
		  font-weight: 600;
		  color: #111827;
		  margin-bottom: 0.5rem;
		}
		
		.login-subtitle {
		  color: #6b7280;
		  margin-bottom: 2rem;
		  font-size: 0.95rem;
		}
		
		/* Google Button */
		.google-btn {
		  display: inline-flex;
		  align-items: center;
		  justify-content: center;
		  gap: 0.75rem;
		  width: 100%;
		  background: #d97706;
		  color: white;
		  padding: 0.875rem 1.5rem;
		  border-radius: 8px;
		  font-size: 1rem;
		  font-weight: 600;
		  text-decoration: none;
		  transition: all 0.2s;
		  border: none;
		  cursor: pointer;
		  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
		}
		
		.google-btn:hover {
		  background: #b45309;
		  transform: translateY(-1px);
		  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		}
		
		.google-btn:active {
		  transform: translateY(0);
		}
		
		.google-icon {
		  width: 20px;
		  height: 20px;
		  background: white;
		  border-radius: 3px;
		  padding: 2px;
		}
		
		/* Security Badge */
		.security-badge {
		  display: flex;
		  align-items: center;
		  justify-content: center;
		  gap: 0.5rem;
		  margin-top: 2rem;
		  color: #6b7280;
		  font-size: 0.875rem;
		}
		
		.shield-icon {
		  width: 16px;
		  height: 16px;
		  color: #d97706;
		}
		
		@media (max-width: 768px) {
		  .hero-title {
			font-size: 2rem;
		  }
		  
		  .hero-subtitle {
			font-size: 1rem;
		  }
		  
		  .login-card {
			padding: 2rem;
		  }
		}
	  </style>
	</head>
	<body>
	  <div class="header">
            <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
            </svg>
            <span class="brand">MetaCAMPUS</span>
            <div style="margin-left: auto; background: #d97706; color: white; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">DEMO</div>
          </div>
	  
	  <div class="main">
		<h1 class="hero-title">Decentralized Academic Records</h1>
		<p class="hero-subtitle">Secure, transparent, and immutable student academic records powered by Algorand blockchain technology.</p>
		
		<div class="login-card">
		  <h2 class="login-title">Welcome</h2>
		  <p class="login-subtitle">Sign in to access your academic portal</p>
		  
		  <a href="/auth/google" class="google-btn">
			<svg class="google-icon" viewBox="0 0 24 24">
			  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
			  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
			  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
			  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>
			Sign in with Google
		  </a>
		  
		  <div class="security-badge">
			<svg class="shield-icon" fill="currentColor" viewBox="0 0 20 20">
			  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
			</svg>
			Secured with blockchain technology
		  </div>
		</div>
	  </div>
	</body>
	</html>
  `);
}

// ===== DEBUG LOGGING =====
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ===== ROUTES =====

// Start Google OAuth flow
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// ===== PROXY TO NEXT.JS APP =====
app.use('/', isAuthenticated, createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
}));

// ===== START SERVER =====
const PORT = 3001;
console.log('About to start listening on port', PORT);
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
  console.log(`Make sure your Next.js app is running on port 3000`);
});
console.log('Listen command executed');