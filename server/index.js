import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for rich text content
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Database setup
const dbPath = join(__dirname, 'blog.db');
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS art_albums (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  db.run('CREATE TABLE IF NOT EXISTS artworks (id INTEGER PRIMARY KEY AUTOINCREMENT, album_id INTEGER, title TEXT, image_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  db.run('CREATE TABLE IF NOT EXISTS artwork_tags (artwork_id INTEGER, tag_id INTEGER)');
  db.run('CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)');
  db.run('CREATE TABLE IF NOT EXISTS album_tags (album_id INTEGER, tag_id INTEGER)');
  db.run('CREATE TABLE IF NOT EXISTS artwork_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, artwork_id INTEGER, user_id INTEGER, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_album_user_title ON art_albums(user_id, title)');
});

// Helper function to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to check admin role
const requireAdmin = (req, res, next) => {
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  });
};

// Helper function to get tags for a post
const getPostTags = (postId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT t.id, t.name FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = ?`,
      [postId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
};

// Helper function to add tags to posts
const addTagsToPosts = async (posts) => {
  const postsWithTags = await Promise.all(
    posts.map(async (post) => {
      const tags = await getPostTags(post.id);
      return { ...post, tags };
    })
  );
  return postsWithTags;
};

// API Routes

// Get all posts
app.get('/api/posts', async (req, res) => {
  const { tag, search, page = 1, limit = 10 } = req.query;
  
  try {
    let query = `SELECT p.*, 
      COALESCE((SELECT COUNT(*) FROM favorites WHERE post_id = p.id), 0) as favorites_count,
      COALESCE((SELECT COUNT(*) FROM comments WHERE post_id = p.id), 0) as comments_count 
      FROM posts p`;
    let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM posts p';
    const params = [];
    const countParams = [];
    
    if (tag) {
      query += ` JOIN post_tags pt ON p.id = pt.post_id
                 JOIN tags t ON pt.tag_id = t.id
                 WHERE t.name = ?`;
      countQuery += ` JOIN post_tags pt ON p.id = pt.post_id
                       JOIN tags t ON pt.tag_id = t.id
                       WHERE t.name = ?`;
      params.push(tag);
      countParams.push(tag);
    } else {
      query += ' WHERE 1=1';
      countQuery += ' WHERE 1=1';
    }

    if (search) {
      query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      countQuery += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    db.all(query, params, async (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Add tags to posts
      const postsWithTags = await addTagsToPosts(rows);

      // Get total count
      db.get(countQuery, countParams, (err, countRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          posts: postsWithTags,
          total: countRow.total,
          page: parseInt(page),
          limit: parseInt(limit)
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get random posts (for sidebar) - MUST be before /api/posts/:id
app.get('/api/posts/random', async (req, res) => {
  const { limit = 5 } = req.query;
  
  try {
    // Get all posts with favorites count
    db.all(
      `SELECT p.*, 
       COALESCE((SELECT COUNT(*) FROM favorites WHERE post_id = p.id), 0) as favorites_count,
       COALESCE((SELECT COUNT(*) FROM comments WHERE post_id = p.id), 0) as comments_count 
       FROM posts p`,
      [],
      async (err, allPosts) => {
        if (err) {
          console.error('Error fetching posts:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (allPosts.length === 0) {
          res.json([]);
          return;
        }
        
        // Shuffle and get random posts
        const shuffled = allPosts.sort(() => Math.random() - 0.5);
        const selectedPosts = shuffled.slice(0, Math.min(parseInt(limit), allPosts.length));
        
        // Add tags to posts
        const postsWithTags = await addTagsToPosts(selectedPosts);
        
        res.json(postsWithTags);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  let userId = null;
  
  // If user is logged in, get their ID
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      // Token invalid, continue as guest
    }
  }
  
  try {
    db.get('SELECT * FROM posts WHERE id = ?', [id], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      
      // Get tags for this post
      const tags = await getPostTags(id);
      row.tags = tags;
      
      // Get favorite count and comments count
      db.get('SELECT COUNT(*) as fav_count FROM favorites WHERE post_id = ?', [id], (err, favRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.get('SELECT COUNT(*) as comment_count FROM comments WHERE post_id = ?', [id], (err, commentRow) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          row.favorites_count = favRow.fav_count;
          row.comments_count = commentRow.comment_count;
          
          // Check if user has favorited this post
          let isFavorited = false;
          if (userId) {
            db.get('SELECT id FROM favorites WHERE user_id = ? AND post_id = ?', [userId, id], (err, userFav) => {
              if (!err && userFav) {
                isFavorited = true;
              }
              row.is_favorited = isFavorited;
              res.json(row);
            });
          } else {
            row.is_favorited = false;
            res.json(row);
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tags with post counts
app.get('/api/tags', (req, res) => {
  db.all(
    `SELECT t.id, t.name, COUNT(pt.post_id) as count 
     FROM tags t 
     LEFT JOIN post_tags pt ON t.id = pt.tag_id 
     GROUP BY t.id 
     ORDER BY count DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Keep backward compatibility with categories endpoint
app.get('/api/categories', (req, res) => {
  db.all(
    `SELECT t.name as category, COUNT(pt.post_id) as count 
     FROM tags t 
     LEFT JOIN post_tags pt ON t.id = pt.tag_id 
     GROUP BY t.id 
     ORDER BY count DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get recent comments (for sidebar)
app.get('/api/comments/recent', (req, res) => {
  const { limit = 10 } = req.query;
  
  db.all(
    `SELECT c.*, u.username, u.avatar, p.title as post_title, p.id as post_id
     FROM comments c 
     JOIN users u ON c.user_id = u.id 
     JOIN posts p ON c.post_id = p.id
     ORDER BY c.created_at DESC
     LIMIT ?`,
    [parseInt(limit)],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Create post (admin only)
app.post('/api/posts', verifyToken, requireAdmin, (req, res) => {
  const { title, content, tags, cover_image } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  db.run(
    'INSERT INTO posts (title, content, cover_image, created_at) VALUES (?, ?, ?, datetime("now"))',
    [title, content, cover_image || ''],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const postId = this.lastID;
      
      // Handle tags
      if (tags && Array.isArray(tags) && tags.length > 0) {
        let completed = 0;
        const totalTags = tags.filter(t => t && t.trim()).length;
        
        if (totalTags === 0) {
          res.json({ id: postId, message: 'Post created successfully' });
          return;
        }
        
        tags.forEach(tagName => {
          if (tagName && tagName.trim()) {
            // First, insert or ignore the tag
            db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName.trim()], (err) => {
              if (err) {
                console.error('Error inserting tag:', err);
                completed++;
                checkComplete();
                return;
              }
              
              // Then link post to tag
              db.run(
                'INSERT INTO post_tags (post_id, tag_id) SELECT ?, id FROM tags WHERE name = ?',
                [postId, tagName.trim()],
                (err) => {
                  if (err) {
                    console.error('Error linking post to tag:', err);
                  }
                  completed++;
                  checkComplete();
                }
              );
            });
          }
        });
        
        function checkComplete() {
          if (completed === totalTags) {
            res.json({ id: postId, message: 'Post created successfully' });
          }
        }
      } else {
        res.json({ id: postId, message: 'Post created successfully' });
      }
    }
  );
});

// Update post (admin only)
app.put('/api/posts/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, content, tags, cover_image } = req.body;

  db.run(
    'UPDATE posts SET title = ?, content = ?, cover_image = ?, updated_at = datetime("now") WHERE id = ?',
    [title, content, cover_image, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      
      // Update tags: delete old ones and add new ones
      db.run('DELETE FROM post_tags WHERE post_id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting old tags:', err);
          res.status(500).json({ error: 'Failed to update tags' });
          return;
        }
        
        if (tags && Array.isArray(tags) && tags.length > 0) {
          let completed = 0;
          const totalTags = tags.filter(t => t && t.trim()).length;
          
          if (totalTags === 0) {
            res.json({ message: 'Post updated successfully' });
            return;
          }
          
          tags.forEach(tagName => {
            if (tagName && tagName.trim()) {
              // First, insert or ignore the tag
              db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName.trim()], (err) => {
                if (err) {
                  console.error('Error inserting tag:', err);
                  completed++;
                  checkComplete();
                  return;
                }
                
                // Then link post to tag
                db.run(
                  'INSERT INTO post_tags (post_id, tag_id) SELECT ?, id FROM tags WHERE name = ?',
                  [id, tagName.trim()],
                  (err) => {
                    if (err) {
                      console.error('Error linking post to tag:', err);
                    }
                    completed++;
                    checkComplete();
                  }
                );
              });
            }
          });
          
          function checkComplete() {
            if (completed === totalTags) {
              res.json({ message: 'Post updated successfully' });
            }
          }
        } else {
          res.json({ message: 'Post updated successfully' });
        }
      });
    }
  );
});

// Delete post (admin only)
app.delete('/api/posts/:id', verifyToken, requireAdmin, (req, res) => {
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

      // Check if this is the first user (make them admin)
      db.get('SELECT COUNT(*) as count FROM users', async (err, countRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        const role = countRow.count === 0 ? 'admin' : 'user';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        db.run(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [username, email, hashedPassword, role],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            // Generate JWT
            const token = jwt.sign({ id: this.lastID, username, email, role }, JWT_SECRET, { expiresIn: '7d' });

            res.json({
              token,
              user: { id: this.lastID, username, email, avatar: '', role },
              message: 'User registered successfully'
            });
          }
        );
      });
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
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar || '', role: user.role },
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
    
    db.get('SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?', [decoded.id], (err, user) => {
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

// Favorites Routes

// Toggle favorite (add/remove)
app.post('/api/posts/:id/favorite', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if already favorited
  db.get('SELECT id FROM favorites WHERE user_id = ? AND post_id = ?', [userId, id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (row) {
      // Remove favorite
      db.run('DELETE FROM favorites WHERE user_id = ? AND post_id = ?', [userId, id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        // Update favorites count
        db.run('UPDATE posts SET favorites_count = (SELECT COUNT(*) FROM favorites WHERE post_id = ?) WHERE id = ?', [id, id]);
        res.json({ favorited: false, message: 'Favorite removed' });
      });
    } else {
      // Add favorite
      db.run('INSERT INTO favorites (user_id, post_id) VALUES (?, ?)', [userId, id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        // Update favorites count
        db.run('UPDATE posts SET favorites_count = (SELECT COUNT(*) FROM favorites WHERE post_id = ?) WHERE id = ?', [id, id]);
        res.json({ favorited: true, message: 'Favorite added' });
      });
    }
  });
});

// Comments Routes

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Get total count
  db.get('SELECT COUNT(*) as total FROM comments WHERE post_id = ?', [id], (err, countRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Get paginated comments
    db.all(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = ? 
       ORDER BY c.created_at ASC
       LIMIT ? OFFSET ?`,
      [id, parseInt(limit), offset],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          comments: rows,
          total: countRow.total,
          page: parseInt(page),
          limit: parseInt(limit)
        });
      }
    );
  });
});

// Add comment
app.post('/api/posts/:id/comments', verifyToken, (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Comment content is required' });
    return;
  }

  db.run(
    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [id, userId, content.trim()],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Get the created comment with user info
      db.get(
        `SELECT c.*, u.username 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.id = ?`,
        [this.lastID],
        (err, comment) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(comment);
        }
      );
    }
  );
});

// Delete comment (user can delete their own, admin can delete any)
app.delete('/api/comments/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if user is admin or comment owner
  db.get('SELECT user_id FROM comments WHERE id = ?', [id], (err, comment) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Check if user is admin
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (user.role !== 'admin' && comment.user_id !== userId) {
        res.status(403).json({ error: 'Not authorized to delete this comment' });
        return;
      }

      db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Comment deleted successfully' });
      });
    });
  });
});

// User Profile Management

// Get current user profile
app.get('/api/user/profile', verifyToken, (req, res) => {
  db.get('SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
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
});

// Update user profile (username, avatar)
app.put('/api/user/profile', verifyToken, async (req, res) => {
  const { username, avatar } = req.body;
  const userId = req.user.id;

  try {
    // Check if username is already taken by another user
    if (username) {
      db.get('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId], (err, existingUser) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (existingUser) {
          res.status(400).json({ error: 'Username already taken' });
          return;
        }

        // Update user
        const updates = [];
        const params = [];
        
        if (username) {
          updates.push('username = ?');
          params.push(username);
        }
        if (avatar !== undefined) {
          updates.push('avatar = ?');
          params.push(avatar);
        }
        
        if (updates.length === 0) {
          res.status(400).json({ error: 'No updates provided' });
          return;
        }
        
        params.push(userId);
        
        db.run(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
          params,
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: 'Profile updated successfully' });
          }
        );
      });
    } else {
      // Only update avatar
      db.run(
        'UPDATE users SET avatar = ? WHERE id = ?',
        [avatar || '', userId],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: 'Profile updated successfully' });
        }
      );
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
app.post('/api/user/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  try {
    // Get user
    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        res.status(400).json({ error: 'Current password is incorrect' });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Password changed successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password (forgot password)
app.post('/api/user/reset-password', async (req, res) => {
  const { username, email, newPassword } = req.body;

  if (!username || !email || !newPassword) {
    res.status(400).json({ error: 'Username, email and new password are required' });
    return;
  }

  try {
    // Find user by username and email
    db.get('SELECT id FROM users WHERE username = ? AND email = ?', [username, email], async (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!user) {
        res.status(404).json({ error: 'User not found with provided credentials' });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Password reset successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all users
app.get('/api/admin/users', verifyToken, requireAdmin, (req, res) => {
  db.all('SELECT id, username, email, avatar, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(users);
  });
});

// Admin: Update user role
app.put('/api/admin/users/:id/role', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['admin', 'user'].includes(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  db.run('UPDATE users SET role = ? WHERE id = ?', [role, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ message: 'User role updated successfully' });
  });
});

// Admin: Delete user
app.delete('/api/admin/users/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Prevent deleting self
  if (parseInt(id) === req.user.id) {
    res.status(400).json({ error: 'Cannot delete yourself' });
    return;
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Get background images from lolicon API (filtered for landscape images)
app.get('/api/background-images', async (req, res) => {
  try {
    const response = await fetch('https://api.lolicon.app/setu/v2?num=20&size=regular&r18=0&excludeAI=true');
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      return res.status(500).json({ error: 'Invalid API response' });
    }
    
    // Filter for landscape images (width > height)
    const landscapeImages = data.data
      .filter(item => item.width > item.height)
      .map(item => ({
        url: item.urls?.regular || item.urls?.original || '',
        width: item.width,
        height: item.height
      }))
      .filter(item => item.url); // Remove empty URLs
    
    // Check which images are accessible (not 404)
    const accessibleImages = [];
    const checkPromises = landscapeImages.map(async (item) => {
      try {
        // 使用GET请求检查，添加浏览器请求头来避免被服务器拒绝
        const response = await fetch(item.url, { 
          method: 'GET',
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.pixiv.net/',
            'Range': 'bytes=0-511' // 只请求前512字节
          }
        });
        
        // 如果返回404，直接排除
        if (response.status === 404) {
          console.log(`Image 404: ${item.url}`);
          return null;
        }
        
        // 检查Content-Type，如果是HTML，说明返回的是错误页面，应该排除
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          console.log(`Image returns HTML (likely 404 page): ${item.url}`);
          return null;
        }
        
        // 检查响应体的开头，如果是HTML标签（如<!DOCTYPE或<html），说明是错误页面
        if (response.status === 200 || response.status === 206) {
          const buffer = await response.arrayBuffer();
          const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer.slice(0, 100));
          const trimmedText = text.trim().toLowerCase();
          
          if (trimmedText.startsWith('<!doctype') || 
              trimmedText.startsWith('<html') || 
              trimmedText.startsWith('<h1')) {
            console.log(`Image returns HTML content (likely 404 page): ${item.url}`);
            return null;
          }
          
          // 检查Content-Type应该是图片类型，或者如果没有Content-Type但内容不是HTML，也允许
          if (contentType.startsWith('image/') || (!contentType && !trimmedText.startsWith('<'))) {
            return item;
          }
        }
        
        console.log(`Image not accessible (status ${response.status}, type ${contentType}): ${item.url}`);
        return null;
      } catch (error) {
        // 如果 fetch 失败，可能是因为服务器拒绝了请求，但图片实际上是可访问的
        // 这种情况下，我们仍然包含这个图片，让浏览器去验证
        console.log(`Image fetch error (but may be accessible in browser): ${item.url} - ${error.message}`);
        // 仍然返回这个图片，因为用户说能看到图片
        return item;
      }
    });
    
    const results = await Promise.all(checkPromises);
    accessibleImages.push(...results.filter(item => item !== null));
    
    res.json({ images: accessibleImages });
  } catch (error) {
    console.error('Failed to fetch background images:', error);
    res.status(500).json({ error: 'Failed to fetch background images' });
  }
});

app.get('/api/art/albums', verifyToken, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT id, title, description, created_at FROM art_albums WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    const tasks = (rows || []).map(a => new Promise((resolve) => {
      db.all('SELECT t.id, t.name FROM album_tags at JOIN tags t ON at.tag_id = t.id WHERE at.album_id = ?', [a.id], (e, ts) => {
        db.get('SELECT image_url FROM artworks WHERE album_id = ? ORDER BY created_at DESC LIMIT 1', [a.id], (e2, coverRow) => {
          resolve({ ...a, tags: ts || [], cover_url: coverRow ? coverRow.image_url : null });
        });
      });
    }));
    Promise.all(tasks).then(list => res.json(list));
  });
});

app.post('/api/art/albums', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { title, description, tags = [] } = req.body;
  if (!title) { res.status(400).json({ error: 'Title required' }); return; }
  db.get('SELECT id FROM art_albums WHERE user_id = ? AND title = ?', [userId, title], (errCheck, exists) => {
    if (errCheck) { res.status(500).json({ error: errCheck.message }); return; }
    if (exists) { res.status(409).json({ error: 'Album title already exists' }); return; }
    db.run('INSERT INTO art_albums (user_id, title, description) VALUES (?, ?, ?)', [userId, title, description || ''], function(err) {
      if (err) { res.status(500).json({ error: err.message }); return; }
      const albumId = this.lastID;
      const upsertTags = Array.isArray(tags) ? tags : [];
      const doTag = (name) => new Promise((resolve) => {
        db.get('SELECT id FROM tags WHERE name = ?', [name], (e, row) => {
          if (row && row.id) resolve(row.id);
          else {
            db.run('INSERT INTO tags (name) VALUES (?)', [name], function(e2){ resolve(this.lastID); });
          }
        });
      });
      Promise.all(upsertTags.map(doTag)).then(ids => {
        const inserts = ids.map(tid => new Promise((r) => {
          db.run('INSERT INTO album_tags (album_id, tag_id) VALUES (?, ?)', [albumId, tid], () => r());
        }));
        Promise.all(inserts).then(() => res.json({ id: albumId, title, description: description || '', tags: upsertTags.map((n,i)=>({ id: ids[i], name: n })) }));
      });
    });
  });
});

app.get('/api/art/albums/:id/artworks', verifyToken, (req, res) => {
  const albumId = req.params.id;
  const userId = req.user.id;
  db.get('SELECT id FROM art_albums WHERE id = ? AND user_id = ?', [albumId, userId], (err, album) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!album) { res.status(404).json({ error: 'Album not found' }); return; }
    db.all('SELECT id, title, image_url, created_at FROM artworks WHERE album_id = ? ORDER BY created_at DESC', [albumId], (err2, arts) => {
      if (err2) { res.status(500).json({ error: err2.message }); return; }
      const tasks = arts.map(a => new Promise((resolve) => {
        db.all('SELECT t.id, t.name FROM artwork_tags at JOIN tags t ON at.tag_id = t.id WHERE at.artwork_id = ?', [a.id], (e, ts) => {
          resolve({ ...a, tags: ts || [] });
        });
      }));
      Promise.all(tasks).then(list => res.json(list));
    });
  });
});

app.post('/api/art/albums/:id/artworks', verifyToken, async (req, res) => {
  const albumId = req.params.id;
  const userId = req.user.id;
  const { title, imageUrl, base64Data, tags = [] } = req.body;
  if (!title) { res.status(400).json({ error: 'Title required' }); return; }
  db.get('SELECT id FROM art_albums WHERE id = ? AND user_id = ?', [albumId, userId], async (err, album) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!album) { res.status(404).json({ error: 'Album not found' }); return; }
    let finalUrl = imageUrl || '';
    try {
      if (!finalUrl && base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
        const m = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
        if (!m) { res.status(400).json({ error: 'Invalid image data' }); return; }
        const ext = m[1].split('/')[1];
        const buf = Buffer.from(m[2], 'base64');
        const fname = `art_${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
        const fpath = join(__dirname, 'uploads', fname);
        fs.writeFileSync(fpath, buf);
        finalUrl = `/uploads/${fname}`;
      }
      db.run('INSERT INTO artworks (album_id, title, image_url) VALUES (?, ?, ?)', [albumId, title, finalUrl], function(err2) {
        if (err2) { res.status(500).json({ error: err2.message }); return; }
        const artworkId = this.lastID;
        const upsertTags = Array.isArray(tags) ? tags : [];
        const doTag = (name) => new Promise((resolve) => {
          db.get('SELECT id FROM tags WHERE name = ?', [name], (e, row) => {
            if (row && row.id) resolve(row.id);
            else {
              db.run('INSERT INTO tags (name) VALUES (?)', [name], function(e2){ resolve(this.lastID); });
            }
          });
        });
        Promise.all(upsertTags.map(doTag)).then(ids => {
          const inserts = ids.map(tid => new Promise((r) => {
            db.run('INSERT INTO artwork_tags (artwork_id, tag_id) VALUES (?, ?)', [artworkId, tid], () => r());
          }));
          Promise.all(inserts).then(() => res.json({ id: artworkId, title, image_url: finalUrl }));
        });
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

app.get('/api/art/artworks/:id/comments', (req, res) => {
  const artworkId = req.params.id;
  db.all(`SELECT ac.id, ac.content, ac.created_at, ac.user_id, u.username, u.avatar 
          FROM artwork_comments ac 
          LEFT JOIN users u ON ac.user_id = u.id 
          WHERE ac.artwork_id = ? 
          ORDER BY ac.created_at DESC`, [artworkId], (err, rows) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    res.json(rows || []);
  });
});

app.post('/api/art/artworks/:id/comments', verifyToken, (req, res) => {
  const artworkId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;
  if (!content || !content.trim()) { res.status(400).json({ error: 'Content required' }); return; }
  db.run('INSERT INTO artwork_comments (artwork_id, user_id, content) VALUES (?, ?, ?)', [artworkId, userId, content.trim()], function(err) {
    if (err) { res.status(500).json({ error: err.message }); return; }
    res.json({ id: this.lastID });
  });
});

app.delete('/api/art/artworks/:id', verifyToken, (req, res) => {
  const artworkId = req.params.id;
  db.get('SELECT a.id, a.album_id, a.image_url, al.user_id FROM artworks a JOIN art_albums al ON a.album_id = al.id WHERE a.id = ?', [artworkId], (err, art) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!art) { res.status(404).json({ error: 'Artwork not found' }); return; }
    if (art.user_id !== req.user.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    const fileRel = art.image_url && art.image_url.startsWith('/uploads/') ? join(__dirname, art.image_url.replace('/uploads/', 'uploads/')) : null;
    db.run('DELETE FROM artwork_tags WHERE artwork_id = ?', [artworkId], (e1) => {
      db.run('DELETE FROM artwork_comments WHERE artwork_id = ?', [artworkId], (e2) => {
        db.run('DELETE FROM artworks WHERE id = ?', [artworkId], (e3) => {
          try { if (fileRel && fs.existsSync(fileRel)) fs.unlinkSync(fileRel); } catch {}
          res.json({ ok: true });
        });
      });
    });
  });
});

app.delete('/api/art/albums/:id', verifyToken, (req, res) => {
  const albumId = req.params.id;
  const userId = req.user.id;
  db.get('SELECT id FROM art_albums WHERE id = ? AND user_id = ?', [albumId, userId], (err, album) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!album) { res.status(404).json({ error: 'Album not found' }); return; }
    db.all('SELECT id, image_url FROM artworks WHERE album_id = ?', [albumId], (e1, arts) => {
      const files = (arts || []).map(a => a.image_url).filter(u => u && u.startsWith('/uploads/')).map(u => join(__dirname, u.replace('/uploads/', 'uploads/')));
      db.run('DELETE FROM album_tags WHERE album_id = ?', [albumId], () => {
        db.run('DELETE FROM artwork_tags WHERE artwork_id IN (SELECT id FROM artworks WHERE album_id = ?)', [albumId], () => {
          db.run('DELETE FROM artwork_comments WHERE artwork_id IN (SELECT id FROM artworks WHERE album_id = ?)', [albumId], () => {
            db.run('DELETE FROM artworks WHERE album_id = ?', [albumId], () => {
              db.run('DELETE FROM art_albums WHERE id = ?', [albumId], () => {
                files.forEach(fp => { try { if (fs.existsSync(fp)) fs.unlinkSync(fp); } catch {} });
                res.json({ ok: true });
              });
            });
          });
        });
      });
    });
  });
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
