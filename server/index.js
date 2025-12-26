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
app.use(express.json({ limit: '50mb' })); // Increase limit for rich text content
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database setup
const dbPath = join(__dirname, 'blog.db');
const db = new sqlite3.Database(dbPath);

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
