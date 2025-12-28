import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'publishStation.db');
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

  // Create announcement table
  db.run(`CREATE TABLE IF NOT EXISTS announcement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create qa table (for Q&A section)
  db.run(`CREATE TABLE IF NOT EXISTS qa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create guestbook table
  db.run(`CREATE TABLE IF NOT EXISTS guestbook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Add parent_id column to comments table if it doesn't exist (for reply support)
  db.all("PRAGMA table_info(comments)", [], (err, columns) => {
    if (err) {
      console.error('Error checking comments table structure:', err);
      return;
    }
    
    const hasParentId = columns.some(col => col.name === 'parent_id');
    if (!hasParentId) {
      db.run("ALTER TABLE comments ADD COLUMN parent_id INTEGER", (alterErr) => {
        if (alterErr) {
          console.error('Error adding parent_id column:', alterErr);
        } else {
          console.log('Added parent_id column to comments table');
        }
      });
    }
  });

  // Initialize users first
  db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }

    if (row.count === 0) {
      // Hash password for admin
      const adminPassword = await bcrypt.hash('123456', 10);
      // Hash password for regular users
      const userPassword = await bcrypt.hash('123456', 10);

      // Insert admin user
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@admin', adminPassword, 'admin'],
        function(err) {
          if (err) {
            console.error('Error inserting admin user:', err);
            return;
          }
          console.log('Admin user created with ID:', this.lastID);
        }
      );

      // Insert regular users
      const regularUsers = [
        ['user1', 'user1@example.com', userPassword, 'user'],
        ['user2', 'user2@example.com', userPassword, 'user'],
        ['user3', 'user3@example.com', userPassword, 'user'],
        ['testuser', 'test@example.com', userPassword, 'user']
      ];

      regularUsers.forEach(user => {
        db.run(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          user,
          function(err) {
            if (err) {
              console.error('Error inserting user:', err);
            }
          }
        );
      });
    }
  });

  // Insert sample data
  const samplePosts = [
    {
      title: '欢迎来到我的博客',
      content: '<p>这是一个现代化的博客系统，使用 Vue + Express + SQLite 构建。</p><p>你可以在这里分享你的想法、经验和知识。系统支持文章分类、搜索等功能。</p><p>开始创建你的第一篇博客文章吧！</p>',
      tags: ['公告', '欢迎'],
      cover_image: ''
    },
    {
      title: 'Vue 开发技巧',
      content: '<h2>组件化开发</h2><p>将 UI 拆分成独立的组件，可以提高代码的可维护性和复用性。</p><h2>状态管理</h2><p>合理使用 Pinia 来管理全局状态。</p>',
      tags: ['技术', 'Vue'],
      cover_image: ''
    },
    {
      title: 'SQLite 数据库使用指南',
      content: '<h2>特点</h2><ul><li>无需服务器</li><li>零配置</li><li>跨平台</li><li>文件数据库</li></ul><h2>使用场景</h2><p>适合小型应用、原型开发和本地开发环境。</p>',
      tags: ['技术', '数据库'],
      cover_image: ''
    },
    {
      title: '前端设计趋势 2025',
      content: '<p>2025 年的前端设计趋势包括：</p><ol><li>玻璃态设计（Glassmorphism）</li><li>新拟态设计（Neumorphism）</li><li>暗色模式</li><li>微交互</li><li>响应式设计</li></ol><p>这些趋势让网站更加现代化和用户友好。</p>',
      tags: ['设计', '趋势'],
      cover_image: ''
    },
    {
      title: 'JavaScript 异步编程',
      content: '<h2>Promise 和 async/await</h2><p>现代 JavaScript 提供了强大的异步编程工具。Promise 可以优雅地处理异步操作，而 async/await 让异步代码看起来像同步代码一样清晰。</p>',
      tags: ['技术', 'JavaScript'],
      cover_image: ''
    },
    {
      title: 'CSS Grid 布局详解',
      content: '<h2>Grid 基础</h2><p>CSS Grid 是一种强大的二维布局系统，可以轻松创建复杂的网页布局。</p><h2>实用技巧</h2><p>使用 grid-template-areas 可以更直观地定义布局区域。</p>',
      tags: ['技术', 'CSS'],
      cover_image: ''
    },
    {
      title: 'Node.js 后端开发入门',
      content: '<h2>Express 框架</h2><p>Express 是 Node.js 最流行的 Web 框架，提供了简洁的 API 和强大的中间件系统。</p><h2>路由和中间件</h2><p>学习如何创建路由和处理请求是后端开发的基础。</p>',
      tags: ['技术', 'Node.js'],
      cover_image: ''
    },
    {
      title: 'Git 版本控制最佳实践',
      content: '<h2>分支策略</h2><p>使用 Git Flow 或 GitHub Flow 可以更好地管理项目开发流程。</p><h2>提交信息规范</h2><p>清晰的提交信息有助于团队协作和代码审查。</p>',
      tags: ['工具', 'Git'],
      cover_image: ''
    },
    {
      title: '前端性能优化',
      content: '<h2>代码分割</h2><p>使用动态导入和代码分割可以减少初始加载时间。</p><h2>图片优化</h2><p>选择合适的图片格式和尺寸可以显著提升页面加载速度。</p>',
      tags: ['性能', '优化'],
      cover_image: ''
    },
    {
      title: 'RESTful API 设计原则',
      content: '<h2>HTTP 方法</h2><p>正确使用 GET、POST、PUT、DELETE 等 HTTP 方法可以设计出清晰的 API。</p><h2>状态码</h2><p>使用合适的 HTTP 状态码可以让客户端更好地处理响应。</p>',
      tags: ['API', '后端'],
      cover_image: ''
    },
    {
      title: 'TypeScript 类型系统',
      content: '<h2>类型注解</h2><p>TypeScript 的类型系统可以帮助我们在开发阶段发现错误。</p><h2>泛型</h2><p>泛型提供了代码复用的强大方式，让代码更加灵活。</p>',
      tags: ['技术', 'TypeScript'],
      cover_image: ''
    }
  ];

  // Check if posts already exist
  db.get('SELECT COUNT(*) as count FROM posts', (err, row) => {
    if (err) {
      console.error('Error checking posts:', err);
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
              // Don't close database here, wait for all initialization
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
                // Don't close database here, wait for all initialization
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
                  // Don't close database here, wait for all initialization to complete
                });
              }
            }
          }
        });
      });
    } else {
      console.log('Posts already exist, skipping sample data insertion');
    }
  });

  // Initialize announcement
  db.get('SELECT COUNT(*) as count FROM announcement', (err, row) => {
    if (err) {
      console.error('Error checking announcement:', err);
      return;
    }
    
    if (row.count === 0) {
      db.run(
        'INSERT INTO announcement (content) VALUES (?)',
        ['<p>欢迎来到我的博客！这里是一个分享知识、经验和想法的地方。</p><p>你可以浏览文章、发表评论、收藏喜欢的内容。</p><p>如有任何问题，欢迎在留言板留言或查看问答专区。</p>'],
        (err) => {
          if (err) {
            console.error('Error inserting announcement:', err);
          } else {
            console.log('Announcement initialized');
          }
        }
      );
    }
  });

  // Initialize Q&A article
  db.get('SELECT COUNT(*) as count FROM qa', (err, row) => {
    if (err) {
      console.error('Error checking qa:', err);
      return;
    }
    
    if (row.count === 0) {
      db.run(
        'INSERT INTO qa (title, content) VALUES (?, ?)',
        [
          '常见问题解答',
          '<h2>如何使用这个博客系统？</h2><p>首先，你需要注册一个账号。注册后，你可以：</p><ul><li>浏览和搜索文章</li><li>收藏喜欢的文章</li><li>发表评论和回复</li><li>在留言板留言</li></ul><h2>如何发表文章？</h2><p>只有管理员可以在后台管理系统中发表和编辑文章。如果你需要发表文章，请联系管理员。</p><h2>如何修改个人资料？</h2><p>登录后，点击右上角的用户名，进入个人资料页面，可以修改用户名和密码。</p>'
        ],
        (err) => {
          if (err) {
            console.error('Error inserting Q&A:', err);
          } else {
            console.log('Q&A initialized');
          }
        }
      );
    }
  });

  // Initialize guestbook messages (need to wait for users to be created)
  setTimeout(() => {
    db.get('SELECT COUNT(*) as count FROM guestbook', (err, row) => {
      if (err) {
        console.error('Error checking guestbook:', err);
        return;
      }
      
      if (row.count === 0) {
        // Get user IDs
        db.all('SELECT id FROM users ORDER BY id LIMIT 4', [], (err, users) => {
          if (err) {
            console.error('Error fetching users for guestbook:', err);
            return;
          }

          if (users.length === 0) {
            console.log('No users found, skipping guestbook initialization');
            return;
          }

          const guestbookMessages = [
            '大家好！第一次来这里，网站很漂亮！',
            '这个博客系统的设计真的很棒，特别是背景效果。',
            '希望能看到更多技术类的文章，加油！',
            '留言功能很实用，界面也很美观。',
            '请问如何收藏文章？我已经登录了但还是找不到收藏按钮。',
            '很喜欢这个网站的设计风格，继续保持！',
            '管理员在吗？我有一个问题想要咨询。',
            '这里的文章质量都很高，会持续关注的。',
            '希望能添加更多功能，比如标签分类浏览。',
            '这个网站的响应速度很快，用户体验很好。',
            '感谢分享这么多有用的内容！'
          ];

          const stmt = db.prepare('INSERT INTO guestbook (user_id, content) VALUES (?, ?)');
          let completed = 0;

          guestbookMessages.forEach((message, index) => {
            const userId = users[index % users.length].id;
            stmt.run(userId, message, (err) => {
              if (err) {
                console.error('Error inserting guestbook message:', err);
              }
              completed++;
              if (completed === guestbookMessages.length) {
                stmt.finalize();
                console.log('Guestbook messages initialized');

                // Initialize comments and replies after guestbook
                initializeComments(db, users);
              }
            });
          });
        });
      } else {
        // If guestbook already has data, just initialize comments
        db.all('SELECT id FROM users ORDER BY id LIMIT 4', [], (err, users) => {
          if (!err && users.length > 0) {
            initializeComments(db, users);
          }
        });
      }
    });
  }, 1000); // Wait 1 second for users to be created

  // Keep database open for async operations, close after all initialization
  setTimeout(() => {
    console.log('Database initialization complete');
    setTimeout(() => {
      closeDatabase();
    }, 1000);
  }, 5000);
});

function initializeComments(db, users) {
  // Check if comments already exist
  db.get('SELECT COUNT(*) as count FROM comments', (err, row) => {
    if (err) {
      console.error('Error checking comments:', err);
      return;
    }

    if (row.count > 0) {
      console.log('Comments already exist, skipping initialization');
      return;
    }

    // Get post IDs
    db.all('SELECT id FROM posts ORDER BY id LIMIT 5', [], (err, posts) => {
      if (err || !posts || posts.length === 0) {
        console.log('No posts found, skipping comments initialization');
        return;
      }

      const commentsData = [
        { postId: posts[0].id, userId: users[0].id, content: '这篇文章写得太好了！', parentId: null },
        { postId: posts[0].id, userId: users[1].id, content: '感谢分享！', parentId: null },
        { postId: posts[1].id, userId: users[2].id, content: '很实用的技巧，收藏了！', parentId: null },
        { postId: posts[2].id, userId: users[0].id, content: 'SQLite确实很适合小型项目', parentId: null },
        { postId: posts[3].id, userId: users[1].id, content: '设计趋势很值得学习', parentId: null }
      ];

      const stmt = db.prepare('INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)');
      let completed = 0;
      const commentIds = [];

      commentsData.forEach((comment, index) => {
        stmt.run(comment.postId, comment.userId, comment.content, comment.parentId, function(err) {
          if (err) {
            console.error('Error inserting comment:', err);
          } else {
            commentIds.push(this.lastID);
          }
          completed++;
          
          if (completed === commentsData.length) {
            stmt.finalize();
            console.log('Comments initialized');

            // Add replies to comments
            if (commentIds.length >= 2) {
              const repliesData = [
                { postId: posts[0].id, userId: users[2].id, content: '同感！', parentId: commentIds[0] },
                { postId: posts[0].id, userId: users[3]?.id || users[0].id, content: '我也这么觉得', parentId: commentIds[0] },
                { postId: posts[0].id, userId: users[1].id, content: '不客气！', parentId: commentIds[1] },
                { postId: posts[1].id, userId: users[0].id, content: '谢谢支持！', parentId: commentIds[2] },
                { postId: posts[1].id, userId: users[2].id, content: '确实很实用', parentId: commentIds[2] }
              ];

              const replyStmt = db.prepare('INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)');
              let repliesCompleted = 0;

              repliesData.forEach((reply) => {
                replyStmt.run(reply.postId, reply.userId, reply.content, reply.parentId, (err) => {
                  if (err) {
                    console.error('Error inserting reply:', err);
                  }
                  repliesCompleted++;
                  if (repliesCompleted === repliesData.length) {
                    replyStmt.finalize();
                    console.log('Replies initialized');
                  }
                });
              });
            }
          }
        });
      });
    });
  });
}

function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
  });
}
