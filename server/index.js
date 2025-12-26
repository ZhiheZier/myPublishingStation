import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = join(__dirname, 'blog.db');
const db = new sqlite3.Database(dbPath);

// API Routes

// Get all posts
app.get('/api/posts', (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  let query = 'SELECT * FROM posts WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM posts WHERE 1=1';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    db.get(countQuery, countParams, (err, countRow) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        posts: rows,
        total: countRow.total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    });
  });
});

// Get single post
app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(row);
  });
});

// Get categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category, COUNT(*) as count FROM posts GROUP BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create post (for admin use)
app.post('/api/posts', (req, res) => {
  const { title, content, category, excerpt, cover_image } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  db.run(
    'INSERT INTO posts (title, content, category, excerpt, cover_image, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
    [title, content, category || '未分类', excerpt || '', cover_image || ''],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Post created successfully' });
    }
  );
});

// Update post
app.put('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, category, excerpt, cover_image } = req.body;

  db.run(
    'UPDATE posts SET title = ?, content = ?, category = ?, excerpt = ?, cover_image = ?, updated_at = datetime("now") WHERE id = ?',
    [title, content, category, excerpt, cover_image, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      res.json({ message: 'Post updated successfully' });
    }
  );
});

// Delete post
app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ message: 'Post deleted successfully' });
  });
});

// Authentication Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email and password are required' });
    return;
  }

  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // Generate JWT
          const token = jwt.sign({ id: this.lastID, username, email }, JWT_SECRET, { expiresIn: '7d' });

          res.json({
            token,
            user: { id: this.lastID, username, email },
            message: 'User registered successfully'
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate JWT
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
        message: 'Login successful'
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
