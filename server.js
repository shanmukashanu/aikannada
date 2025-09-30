const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const { connectDB } = require("./src/config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
const articlesFile = path.join(dataDir, "articles.json");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(articlesFile)) {
    fs.writeFileSync(articlesFile, "[]", "utf-8");
}

// Helpers to read/write articles
function readArticles() {
    try {
        const raw = fs.readFileSync(articlesFile, "utf-8");
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

function writeArticles(list) {
    fs.writeFileSync(articlesFile, JSON.stringify(list, null, 2), "utf-8");
}

// API routes
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from the backend 👋" });
});

app.post("/api/echo", (req, res) => {
    const { name, text } = req.body || {};
    res.json({
        received: { name, text },
        note: "POST received successfully",
    });
});

// New dynamic API mounts
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/posts', require('./src/routes/posts'));
app.use('/api/comments', require('./src/routes/comments'));
app.use('/api/uploads', require('./src/routes/uploads'));
app.use('/api/subscriptions', require('./src/routes/subscriptions'));
app.use('/api/home', require('./src/routes/home'));
app.use('/api/contact', require('./src/routes/contact'));
app.use('/api/imports', require('./src/routes/imports'));

// Articles API
app.get("/api/articles", (req, res) => {
    const articles = readArticles();
    // newest first
    articles.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    res.json(articles);
});

app.get("/api/articles/:id", (req, res) => {
    const articleId = parseInt(req.params.id);
    const articles = readArticles();
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
        return res.status(404).json({ error: "Article not found" });
    }
    
    res.json(article);
});

// Serve article page
app.get("/article/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "article.html"));
});

// Serve new admin UI
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin2.html"));
});

// Fallback → serve index.html for all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server after DB connect
connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
