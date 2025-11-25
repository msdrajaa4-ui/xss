const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper functions for database
function readJSON(filename) {
  const data = fs.readFileSync(path.join(__dirname, 'database', filename), 'utf8');
  return JSON.parse(data);
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(__dirname, 'database', filename), JSON.stringify(data, null, 2));
}

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Challenge 1: Reflected XSS - Search
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  const resources = readJSON('resources.json');
  
  // Vulnerable: Direct output without sanitization
  let results = resources.resources.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.description.toLowerCase().includes(query.toLowerCase())
  );
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Search Resources - K-Linker</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <nav class="navbar">
          <div class="logo">K-LINKER</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/search">Resources</a>
            <a href="/comments">Community</a>
            <a href="/chat">Chat</a>
            <a href="/events">Events</a>
            <a href="/profile">Profile</a>
            <a href="/scoreboard">Score: <span id="score">0</span> pts</a>
          </div>
        </nav>
        <div class="content">
          <h1>Search Resources</h1>
          <form method="GET" action="/search">
            <input type="text" name="q" placeholder="Search resources..." value="${query}">
            <button type="submit">Search</button>
          </form>
          <div class="search-info">
            <p>Search results for: ${query}</p>
          </div>
          <div class="results">
            ${results.map(r => `
              <div class="resource-card">
                <h3>${r.name}</h3>
                <span class="badge">${r.category}</span>
                <p>${r.description}</p>
              </div>
            `).join('')}
            ${results.length === 0 ? '<p class="no-results">No resources found</p>' : ''}
          </div>
        </div>
      </div>
      <script src="/script.js"></script>
      <script>
        // Challenge 1 detection
        if (document.querySelector('script[data-xss="challenge1"]')) {
          fetch('/api/complete/challenge1', { method: 'POST' });
        }
      </script>
    </body>
    </html>
  `);
});

// Challenge 2: Stored XSS - Comments
app.get('/comments', (req, res) => {
  const comments = readJSON('comments.json');
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Community Comments - K-Linker</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <nav class="navbar">
          <div class="logo">K-LINKER</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/search">Resources</a>
            <a href="/comments">Community</a>
            <a href="/chat">Chat</a>
            <a href="/events">Events</a>
            <a href="/profile">Profile</a>
            <a href="/scoreboard">Score: <span id="score">0</span> pts</a>
          </div>
        </nav>
        <div class="content">
          <h1>Community Comments</h1>
          <div class="comment-form">
            <h2>Post a Comment</h2>
            <form method="POST" action="/api/comments">
              <input type="text" name="author" placeholder="Your name" required>
              <textarea name="text" placeholder="Your comment..." required></textarea>
              <button type="submit">Post Comment</button>
            </form>
          </div>
          <div class="comments-list">
            <h2>Recent Comments</h2>
            ${comments.comments.map(c => `
              <div class="comment">
                <div class="comment-header">
                  <span class="author">${c.author}</span>
                  <span class="timestamp">${new Date(c.timestamp).toLocaleString()}</span>
                </div>
                <div class="comment-body">${c.text}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <script src="/script.js"></script>
      <script>
        // Challenge 2 detection
        if (document.querySelector('script[data-xss="challenge2"]')) {
          fetch('/api/complete/challenge2', { method: 'POST' });
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/api/comments', (req, res) => {
  const { author, text } = req.body;
  const comments = readJSON('comments.json');
  
  const newComment = {
    id: comments.comments.length + 1,
    author: author,
    text: text, // Vulnerable: No sanitization
    timestamp: new Date().toISOString()
  };
  
  comments.comments.push(newComment);
  writeJSON('comments.json', comments);
  
  res.redirect('/comments');
});

// Challenge 3: DOM XSS - Profile Update
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

// Challenge 4: Reflected XSS - Error Message
app.get('/login', (req, res) => {
  const error = req.query.error || '';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - K-Linker</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <nav class="navbar">
          <div class="logo">K-LINKER</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/search">Resources</a>
            <a href="/comments">Community</a>
            <a href="/chat">Chat</a>
            <a href="/events">Events</a>
            <a href="/profile">Profile</a>
            <a href="/scoreboard">Score: <span id="score">0</span> pts</a>
          </div>
        </nav>
        <div class="content">
          <div class="login-form">
            <h1>Member Login</h1>
            ${error ? `<div class="error-message">Error: ${error}</div>` : ''}
            <form method="POST" action="/api/login">
              <input type="text" name="username" placeholder="Username" required>
              <input type="password" name="password" placeholder="Password" required>
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
      <script src="/script.js"></script>
      <script>
        // Challenge 4 detection
        if (document.querySelector('script[data-xss="challenge4"]')) {
          fetch('/api/complete/challenge4', { method: 'POST' });
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/api/login', (req, res) => {
  res.redirect('/login?error=Invalid credentials');
});

// Challenge 5: Stored XSS - Chat Room
app.get('/chat', (req, res) => {
  const chat = readJSON('chat.json');
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Chat Room - K-Linker</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <nav class="navbar">
          <div class="logo">K-LINKER</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/search">Resources</a>
            <a href="/comments">Community</a>
            <a href="/chat">Chat</a>
            <a href="/events">Events</a>
            <a href="/profile">Profile</a>
            <a href="/scoreboard">Score: <span id="score">0</span> pts</a>
          </div>
        </nav>
        <div class="content">
          <h1>K-Linker Chat Room</h1>
          <div class="chat-container">
            <div class="chat-messages" id="chatMessages">
              ${chat.messages.map(m => `
                <div class="chat-message">
                  <span class="chat-user">${m.username}:</span>
                  <span class="chat-text">${m.message}</span>
                  <span class="chat-time">${new Date(m.timestamp).toLocaleTimeString()}</span>
                </div>
              `).join('')}
            </div>
            <form method="POST" action="/api/chat" class="chat-form">
              <input type="text" name="username" placeholder="Username" required>
              <input type="text" name="message" placeholder="Type your message..." required>
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
      <script src="/script.js"></script>
      <script>
        // Challenge 5 detection
        if (document.querySelector('script[data-xss="challenge5"]')) {
          fetch('/api/complete/challenge5', { method: 'POST' });
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/api/chat', (req, res) => {
  const { username, message } = req.body;
  const chat = readJSON('chat.json');
  
  const newMessage = {
    id: chat.messages.length + 1,
    username: username,
    message: message, // Vulnerable: No sanitization
    timestamp: new Date().toISOString()
  };
  
  chat.messages.push(newMessage);
  writeJSON('chat.json', chat);
  
  res.redirect('/chat');
});

// Challenge 6: DOM XSS - URL Fragment (served as static HTML)
app.get('/welcome', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'welcome.html'));
});

// Challenge 7: Reflected XSS - Event Filter
app.get('/events', (req, res) => {
  const filter = req.query.filter || '';
  const events = readJSON('events.json');
  
  let filteredEvents = events.events;
  if (filter) {
    filteredEvents = events.events.filter(e => 
      e.title.toLowerCase().includes(filter.toLowerCase())
    );
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Events - K-Linker</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <nav class="navbar">
          <div class="logo">K-LINKER</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/search">Resources</a>
            <a href="/comments">Community</a>
            <a href="/chat">Chat</a>
            <a href="/events">Events</a>
            <a href="/profile">Profile</a>
            <a href="/scoreboard">Score: <span id="score">0</span> pts</a>
          </div>
        </nav>
        <div class="content">
          <h1>Upcoming Events</h1>
          <form method="GET" action="/events">
            <input type="text" name="filter" placeholder="Filter events..." value="${filter}">
            <button type="submit">Filter</button>
          </form>
          ${filter ? `<div class="filter-info"><p>Filtering by: <span class="filter-tag">${filter}</span></p></div>` : ''}
          <div class="events-list">
            ${filteredEvents.map(e => `
              <div class="event-card">
                <h3>${e.title}</h3>
                <p>${e.description}</p>
                <div class="event-details">
                  <span>📅 ${e.date}</span>
                  <span>📍 ${e.location}</span>
                </div>
                <a href="/event/${e.id}">View Details</a>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <script src="/script.js"></script>
      <script>
        // Challenge 7 detection
        if (document.querySelector('script[data-xss="challenge7"]')) {
          fetch('/api/complete/challenge7', { method: 'POST' });
        }
      </script>
    </body>
    </html>
  `);
});

// Challenge 8: Stored XSS - Event Description
app.get('/event/:id', (req, res) => {
  const events = readJSON('events.json');
  const event = events.events.find(e => e.id == req.params.id);
  
  if (!event) {
    return res.status(404).send('Event not found');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${event.title} - K-Linker</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <nav class="navbar">
          <div class="logo">K-LINKER</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/search">Resources</a>
            <a href="/comments">Community</a>
            <a href="/chat">Chat</a>
            <a href="/events">Events</a>
            <a href="/profile">Profile</a>
            <a href="/scoreboard">Score: <span id="score">0</span> pts</a>
          </div>
        </nav>
        <div class="content">
          <div class="event-detail">
            <h1>${event.title}</h1>
            <div class="event-info">
              <p><strong>Date:</strong> ${event.date}</p>
              <p><strong>Location:</strong> ${event.location}</p>
            </div>
            <div class="event-description">
              <h2>Description</h2>
              <p>${event.description}</p>
            </div>
            <form method="POST" action="/api/event/${event.id}/update">
              <h2>Update Event Description (Admin)</h2>
              <textarea name="description" placeholder="New description...">${event.description}</textarea>
              <button type="submit">Update Description</button>
            </form>
          </div>
        </div>
      </div>
      <script src="/script.js"></script>
      <script>
        // Challenge 8 detection
        if (document.querySelector('script[data-xss="challenge8"]')) {
          fetch('/api/complete/challenge8', { method: 'POST' });
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/api/event/:id/update', (req, res) => {
  const events = readJSON('events.json');
  const event = events.events.find(e => e.id == req.params.id);
  
  if (event) {
    event.description = req.body.description; // Vulnerable: No sanitization
    writeJSON('events.json', events);
  }
  
  res.redirect(`/event/${req.params.id}`);
});

// Challenge 9: DOM XSS - JavaScript Protocol (static HTML)
app.get('/resources', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'resources.html'));
});

// Challenge 10: Advanced Reflected XSS - WAF Bypass
app.get('/feedback', (req, res) => {
  const message = req.query.msg || '';
  
  // Simple WAF that blocks common XSS patterns
  const blocked = /<script|javascript:|onerror|onload/i.test(message);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Feedback - K-Linker</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <nav class="navbar">
          <div class="logo">K-LINKER</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/search">Resources</a>
            <a href="/comments">Community</a>
            <a href="/chat">Chat</a>
            <a href="/events">Events</a>
            <a href="/profile">Profile</a>
            <a href="/scoreboard">Score: <span id="score">0</span> pts</a>
          </div>
        </nav>
        <div class="content">
          <h1>Feedback System</h1>
          ${blocked ? '<div class="blocked-message">⚠️ Blocked: Potential XSS detected by WAF</div>' : ''}
          <form method="GET" action="/feedback">
            <textarea name="msg" placeholder="Your feedback...">${message}</textarea>
            <button type="submit">Submit Feedback</button>
          </form>
          ${!blocked && message ? `<div class="feedback-display"><h3>Your Feedback:</h3><div>${message}</div></div>` : ''}
        </div>
      </div>
      <script src="/script.js"></script>
      <script>
        // Challenge 10 detection
        if (document.querySelector('img[data-xss="challenge10"]') || document.querySelector('svg[data-xss="challenge10"]')) {
          fetch('/api/complete/challenge10', { method: 'POST' });
        }
      </script>
    </body>
    </html>
  `);
});

// Scoreboard
app.get('/scoreboard', (req, res) => {
  const scores = readJSON('scores.json');
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Scoreboard - K-Linker XSS Challenges</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <nav class="navbar">
          <div class="logo">K-LINKER</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/search">Resources</a>
            <a href="/comments">Community</a>
            <a href="/chat">Chat</a>
            <a href="/events">Events</a>
            <a href="/profile">Profile</a>
            <a href="/scoreboard">Score: <span id="score">${scores.totalScore}</span> pts</a>
          </div>
        </nav>
        <div class="content">
          <h1>🎯 XSS Challenge Scoreboard</h1>
          <div class="total-score">
            <h2>Total Score: ${scores.totalScore} / 2500 pts</h2>
            <div class="progress-bar">
              <div class="progress" style="width: ${(scores.totalScore / 2500) * 100}%"></div>
            </div>
          </div>
          <div class="challenges-grid">
            ${Object.entries(scores.challenges).map(([key, challenge]) => `
              <div class="challenge-card ${challenge.completed ? 'completed' : ''}">
                <h3>${challenge.name}</h3>
                <div class="challenge-points">${challenge.points} pts</div>
                <div class="challenge-status">
                  ${challenge.completed ? '✓ Completed' : '○ Incomplete'}
                </div>
              </div>
            `).join('')}
          </div>
          <div class="reset-section">
            <button onclick="resetProgress()">Reset Progress</button>
          </div>
        </div>
      </div>
      <script src="/script.js"></script>
      <script>
        function resetProgress() {
          if (confirm('Are you sure you want to reset all progress?')) {
            fetch('/api/reset', { method: 'POST' })
              .then(() => location.reload());
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoints for challenge completion
app.post('/api/complete/:challengeId', (req, res) => {
  const challengeId = req.params.challengeId;
  const scores = readJSON('scores.json');
  
  if (scores.challenges[challengeId] && !scores.challenges[challengeId].completed) {
    scores.challenges[challengeId].completed = true;
    scores.totalScore += scores.challenges[challengeId].points;
    writeJSON('scores.json', scores);
    res.json({ success: true, totalScore: scores.totalScore });
  } else {
    res.json({ success: false, message: 'Challenge already completed or not found' });
  }
});

app.get('/api/scores', (req, res) => {
  const scores = readJSON('scores.json');
  res.json(scores);
});

app.post('/api/reset', (req, res) => {
  const scores = readJSON('scores.json');
  scores.totalScore = 0;
  Object.keys(scores.challenges).forEach(key => {
    scores.challenges[key].completed = false;
  });
  writeJSON('scores.json', scores);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 K-Linker XSS Challenge Server running on http://localhost:${PORT}`);
  console.log(`📚 Total Challenges: 10 (2500 points)`);
  console.log(`🎯 Good luck with the challenges!`);
});
