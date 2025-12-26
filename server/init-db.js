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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create posts table
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT,
    cover_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
  )`);

  // Insert sample data
  const samplePosts = [
    {
      title: '欢迎来到我的博客',
      content: '这是一个现代化的博客系统，使用 React + Express + SQLite 构建。\n\n你可以在这里分享你的想法、经验和知识。系统支持文章分类、搜索等功能。\n\n开始创建你的第一篇博客文章吧！',
      excerpt: '欢迎来到我的博客，这是一个现代化的博客系统。',
      category: '公告',
      cover_image: ''
    },
    {
      title: 'React 开发技巧',
      content: 'React 是一个强大的前端框架，这里分享一些实用的开发技巧。\n\n## 组件化开发\n\n将 UI 拆分成独立的组件，可以提高代码的可维护性和复用性。\n\n## 状态管理\n\n合理使用 useState 和 useEffect 来管理组件状态。',
      excerpt: '分享一些 React 开发的实用技巧和最佳实践。',
      category: '技术',
      cover_image: ''
    },
    {
      title: 'SQLite 数据库使用指南',
      content: 'SQLite 是一个轻量级的嵌入式数据库，非常适合小型项目。\n\n## 特点\n\n- 无需服务器\n- 零配置\n- 跨平台\n- 文件数据库\n\n## 使用场景\n\n适合小型应用、原型开发和本地开发环境。',
      excerpt: '介绍 SQLite 数据库的特点和使用方法。',
      category: '技术',
      cover_image: ''
    },
    {
      title: '前端设计趋势 2024',
      content: '2024 年的前端设计趋势包括：\n\n1. 玻璃态设计（Glassmorphism）\n2. 新拟态设计（Neumorphism）\n3. 暗色模式\n4. 微交互\n5. 响应式设计\n\n这些趋势让网站更加现代化和用户友好。',
      excerpt: '探讨 2024 年前端设计的最新趋势和发展方向。',
      category: '设计',
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
      const stmt = db.prepare('INSERT INTO posts (title, content, excerpt, category, cover_image) VALUES (?, ?, ?, ?, ?)');
      
      samplePosts.forEach(post => {
        stmt.run(post.title, post.content, post.excerpt, post.category, post.cover_image);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting sample data:', err);
        } else {
          console.log('Sample data inserted successfully');
        }
        closeDatabase();
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
