# Getting Started with K-Linker XSS Challenges

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
cd xss-challenge-app
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
🚀 K-Linker XSS Challenge Server running on http://localhost:3000
📚 Total Challenges: 10 (2500 points)
🎯 Good luck with the challenges!
```

### Step 3: Open Your Browser
Navigate to: **http://localhost:3000**

## 📚 First Steps

### 1. Explore the Application
- Browse through different pages
- Post comments, send chat messages
- Search for resources
- View events

### 2. Check the Scoreboard
Visit: **http://localhost:3000/scoreboard**

You'll see all 10 challenges worth 250 points each.

### 3. Start with Easy Challenges

#### Challenge 1: Search (Reflected XSS)
1. Go to Resources page
2. In the search box, enter: `<script data-xss="challenge1">alert('XSS')</script>`
3. Submit the search
4. If successful, you'll get 250 points!

#### Challenge 2: Comments (Stored XSS)
1. Go to Community page
2. Post a comment: `<script data-xss="challenge2">alert('XSS')</script>`
3. Submit and refresh the page
4. Score updated!

## 🎯 Challenge Difficulty Guide

- ⭐ **EASY** (Challenges 1, 2, 4): Perfect for beginners
- ⭐⭐ **MEDIUM** (Challenges 3, 5, 6, 7): Requires understanding of DOM/URLs
- ⭐⭐⭐ **HARD** (Challenges 8, 9): More complex scenarios
- ⭐⭐⭐⭐ **EXPERT** (Challenge 10): WAF bypass techniques needed

## 💡 Tips for Success

### Understanding the Detection System
Each challenge requires you to include a specific attribute in your XSS payload:
```javascript
data-xss="challenge1"  // For Challenge 1
data-xss="challenge2"  // For Challenge 2
// ... and so on
```

The system automatically detects these attributes and awards points.

### Common XSS Payloads
```html
<!-- Basic Script Tag -->
<script>alert('XSS')</script>

<!-- With Detection Attribute -->
<script data-xss="challenge1">alert('XSS')</script>

<!-- Image Tag -->
<img src=x onerror="alert('XSS')">

<!-- SVG Tag -->
<svg onload="alert('XSS')">

<!-- JavaScript Protocol -->
javascript:alert('XSS')
```

### Testing Different Contexts
- **URL Parameters**: `?param=<payload>`
- **URL Fragments**: `#<payload>`
- **Form Fields**: Enter payload in input/textarea
- **POST Data**: Submit forms with payloads

## 🔍 Where to Find Vulnerabilities

| Challenge | Location | Type | Input Method |
|-----------|----------|------|--------------|
| 1 | `/search` | Reflected | Query parameter `q` |
| 2 | `/comments` | Stored | Comment form |
| 3 | `/profile` | DOM | URL parameters |
| 4 | `/login` | Reflected | Query parameter `error` |
| 5 | `/chat` | Stored | Chat message form |
| 6 | `/welcome` | DOM | URL fragment (#) |
| 7 | `/events` | Reflected | Query parameter `filter` |
| 8 | `/event/:id` | Stored | Event update form |
| 9 | `/resources` | DOM | Quick link form |
| 10 | `/feedback` | Reflected (WAF) | Query parameter `msg` |

## 🛠️ Troubleshooting

### Challenge Not Completing?
1. Make sure you included the correct `data-xss` attribute
2. Check browser console for errors
3. Try refreshing the page
4. Visit `/scoreboard` to check status

### Server Not Starting?
```bash
# Check if port 3000 is already in use
# Windows:
netstat -ano | findstr :3000

# Kill the process or change port in server.js
```

### Reset Progress
Visit the scoreboard and click "Reset Progress" to start over.

## 📖 Learning Resources

### Recommended Reading
- OWASP XSS Guide: https://owasp.org/www-community/attacks/xss/
- PortSwigger XSS Labs: https://portswigger.net/web-security/cross-site-scripting
- MDN Web Security: https://developer.mozilla.org/en-US/docs/Web/Security

### XSS Types Covered
1. **Reflected XSS**: Input is immediately reflected in the response
2. **Stored XSS**: Payload is stored and executed later
3. **DOM-based XSS**: Vulnerability in client-side JavaScript
4. **WAF Bypass**: Evading basic security filters

## 🎓 Educational Goals

After completing these challenges, you should understand:
- How XSS vulnerabilities occur
- Different contexts where XSS can exist
- Client-side vs. server-side vulnerabilities
- Why input validation is critical
- How to bypass basic filters
- Proper XSS prevention techniques

## ⚠️ Important Reminders

1. **This is a local testing environment only**
2. **Never deploy this to a public server**
3. **Use this knowledge ethically**
4. **Always get permission before testing real applications**

## 🎉 Have Fun!

The goal is to learn and understand XSS vulnerabilities in a safe environment. Take your time, experiment with different payloads, and most importantly - have fun hacking!

**Target: 2500 points - Can you get them all?**

---

Need help? Check the main README.md for detailed challenge descriptions and example payloads.
