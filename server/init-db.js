import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'blog.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create posts table
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    favorites_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
  )`);

  // Create favorites table
  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )`);

  // Create comments table
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Create tags table
  db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create post_tags junction table
  db.run(`CREATE TABLE IF NOT EXISTS post_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )`);

  // Insert sample data
  const samplePosts = [
    {
      title: '欢迎来到我的博客',
      content: '这是一个现代化的博客系统，使用 Vue + Express + SQLite 构建。\n\n你可以在这里分享你的想法、经验和知识。系统支持文章分类、搜索等功能。\n\n开始创建你的第一篇博客文章吧！',
      tags: ['公告', '欢迎'],
      cover_image: ''
    },
    {
      title: 'Vue 开发技巧',
      content: 'Vue 是一个强大的前端框架，这里分享一些实用的开发技巧。\n\n## 组件化开发\n\n将 UI 拆分成独立的组件，可以提高代码的可维护性和复用性。\n\n## 状态管理\n\n合理使用 Pinia 来管理全局状态。',
      tags: ['技术', 'Vue'],
      cover_image: ''
    },
    {
      title: 'SQLite 数据库使用指南',
      content: 'SQLite 是一个轻量级的嵌入式数据库，非常适合小型项目。\n\n## 特点\n\n- 无需服务器\n- 零配置\n- 跨平台\n- 文件数据库\n\n## 使用场景\n\n适合小型应用、原型开发和本地开发环境。',
      tags: ['技术', '数据库'],
      cover_image: ''
    },
    {
      title: '前端设计趋势 2025',
      content: '2025 年的前端设计趋势包括：\n\n1. 玻璃态设计（Glassmorphism）\n2. 新拟态设计（Neumorphism）\n3. 暗色模式\n4. 微交互\n5. 响应式设计\n\n这些趋势让网站更加现代化和用户友好。',
      tags: ['设计', '趋势'],
      cover_image: ''
    }
  ];

  // Check if posts already exist
  db.get('SELECT COUNT(*) as count FROM posts', (err, row) => {
    if (err) {
      console.error('Error checking posts:', err);
      closeDatabase();
      return;
    }

    if (row.count === 0) {
      // Insert sample data only if table is empty
      const stmt = db.prepare('INSERT INTO posts (title, content, cover_image) VALUES (?, ?, ?)');
      
      let postsCompleted = 0;
      
      samplePosts.forEach((post) => {
        stmt.run(post.title, post.content, post.cover_image, function(err) {
          if (err) {
            console.error('Error inserting post:', err);
            postsCompleted++;
            if (postsCompleted === samplePosts.length) {
              stmt.finalize();
              closeDatabase();
            }
            return;
          }
          
          const postId = this.lastID;
          let tagsCompleted = 0;
          const totalTags = post.tags.length;
          
          if (totalTags === 0) {
            postsCompleted++;
            if (postsCompleted === samplePosts.length) {
              stmt.finalize((err) => {
                if (err) console.error('Error finalizing statement:', err);
                else console.log('Sample data inserted successfully');
                closeDatabase();
              });
            }
            return;
          }
          
          // Insert tags for this post
          post.tags.forEach(tagName => {
            // First, insert or ignore the tag
            db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName], function(tagErr) {
              if (tagErr) {
                console.error('Error inserting tag:', tagErr);
                tagsCompleted++;
                checkComplete();
                return;
              }
              
              // Then link post to tag
              db.run(
                'INSERT INTO post_tags (post_id, tag_id) SELECT ?, id FROM tags WHERE name = ?',
                [postId, tagName],
                function(linkErr) {
                  if (linkErr) {
                    console.error('Error linking post to tag:', linkErr);
                  }
                  tagsCompleted++;
                  checkComplete();
                }
              );
            });
          });
          
          function checkComplete() {
            if (tagsCompleted === totalTags) {
              postsCompleted++;
              if (postsCompleted === samplePosts.length) {
                stmt.finalize((err) => {
                  if (err) console.error('Error finalizing statement:', err);
                  else console.log('Sample data inserted successfully');
                  closeDatabase();
                });
              }
            }
          }
        });
      });
    } else {
      console.log('Posts already exist, skipping sample data insertion');
      closeDatabase();
    }
  });
});

function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
  });
}
