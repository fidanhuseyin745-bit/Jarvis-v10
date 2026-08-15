'use strict';

const fs = require('fs');
const path = require('path');

class CodeGenerator {

  detectTemplate(instruction) {

    const text = instruction.toLowerCase();

    if (text.includes('todo')) return 'todo';
    if (text.includes('blog')) return 'blog';
    if (text.includes('admin panel') || text.includes('admin paneli') || text.includes('yonetim paneli') || text.includes('yönetim paneli')) return 'admin';

    return null;

  }

  ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
  }

  writeIfMissing(filePath, content) {

    if (fs.existsSync(filePath)) {
      return false;
    }

    this.ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);

    return true;

  }

  wireIntoIndex(dir, requireLine, useLine) {

    const indexPath = path.join(dir, 'index.js');

    if (!fs.existsSync(indexPath)) {
      return false;
    }

    let content = fs.readFileSync(indexPath, 'utf8');

    if (content.includes(useLine)) {
      return false;
    }

    if (!content.includes(requireLine)) {
      content = requireLine + '\n' + content;
    }

    if (content.includes('app.listen(')) {
      content = content.replace('app.listen(', useLine + '\n\napp.listen(');
    } else {
      content = content + '\n' + useLine + '\n';
    }

    fs.writeFileSync(indexPath, content);

    return true;

  }

  generateTodo(dir) {

    const created = [];

    const modelContent = `'use strict';

let todos = [];
let nextId = 1;

module.exports = {

  getAll() {
    return todos;
  },

  getById(id) {
    return todos.find(t => t.id === Number(id));
  },

  create(title) {
    const todo = { id: nextId++, title, done: false };
    todos.push(todo);
    return todo;
  },

  update(id, changes) {
    const todo = this.getById(id);
    if (!todo) return null;
    Object.assign(todo, changes);
    return todo;
  },

  remove(id) {
    const before = todos.length;
    todos = todos.filter(t => t.id !== Number(id));
    return todos.length < before;
  }

};
`;

    const controllerContent = `'use strict';

const Todo = require('../models/todoModel');

module.exports = {

  list(req, res) {
    res.json(Todo.getAll());
  },

  get(req, res) {
    const todo = Todo.getById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo bulunamadi' });
    res.json(todo);
  },

  create(req, res) {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'title alani zorunlu' });
    res.status(201).json(Todo.create(title));
  },

  update(req, res) {
    const todo = Todo.update(req.params.id, req.body);
    if (!todo) return res.status(404).json({ error: 'Todo bulunamadi' });
    res.json(todo);
  },

  remove(req, res) {
    const ok = Todo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Todo bulunamadi' });
    res.status(204).end();
  }

};
`;

    const routeContent = `'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/todoController');

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
`;

    if (this.writeIfMissing(path.join(dir, 'models', 'todoModel.js'), modelContent)) created.push('models/todoModel.js');
    if (this.writeIfMissing(path.join(dir, 'controllers', 'todoController.js'), controllerContent)) created.push('controllers/todoController.js');
    if (this.writeIfMissing(path.join(dir, 'routes', 'todoRoutes.js'), routeContent)) created.push('routes/todoRoutes.js');

    this.wireIntoIndex(
      dir,
      "const todoRoutes = require('./routes/todoRoutes');",
      "app.use('/api/todos', todoRoutes);"
    );

    return created;

  }

  generateBlog(dir) {

    const created = [];

    const modelContent = `'use strict';

let posts = [];
let nextId = 1;

module.exports = {

  getAll() {
    return posts;
  },

  getById(id) {
    return posts.find(p => p.id === Number(id));
  },

  create(title, content) {
    const post = { id: nextId++, title, content, createdAt: new Date().toISOString() };
    posts.push(post);
    return post;
  },

  update(id, changes) {
    const post = this.getById(id);
    if (!post) return null;
    Object.assign(post, changes);
    return post;
  },

  remove(id) {
    const before = posts.length;
    posts = posts.filter(p => p.id !== Number(id));
    return posts.length < before;
  }

};
`;

    const controllerContent = `'use strict';

const Post = require('../models/postModel');

module.exports = {

  list(req, res) {
    res.json(Post.getAll());
  },

  get(req, res) {
    const post = Post.getById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Yazi bulunamadi' });
    res.json(post);
  },

  create(req, res) {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title ve content zorunlu' });
    res.status(201).json(Post.create(title, content));
  },

  update(req, res) {
    const post = Post.update(req.params.id, req.body);
    if (!post) return res.status(404).json({ error: 'Yazi bulunamadi' });
    res.json(post);
  },

  remove(req, res) {
    const ok = Post.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Yazi bulunamadi' });
    res.status(204).end();
  }

};
`;

    const routeContent = `'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
`;

    if (this.writeIfMissing(path.join(dir, 'models', 'postModel.js'), modelContent)) created.push('models/postModel.js');
    if (this.writeIfMissing(path.join(dir, 'controllers', 'postController.js'), controllerContent)) created.push('controllers/postController.js');
    if (this.writeIfMissing(path.join(dir, 'routes', 'postRoutes.js'), routeContent)) created.push('routes/postRoutes.js');

    this.wireIntoIndex(
      dir,
      "const postRoutes = require('./routes/postRoutes');",
      "app.use('/api/posts', postRoutes);"
    );

    return created;

  }

  generateAdmin(dir) {

    const created = [];

    const controllerContent = `'use strict';

module.exports = {

  dashboard(req, res) {
    res.json({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }

};
`;

    const routeContent = `'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');

router.get('/dashboard', controller.dashboard);

module.exports = router;
`;

    if (this.writeIfMissing(path.join(dir, 'controllers', 'adminController.js'), controllerContent)) created.push('controllers/adminController.js');
    if (this.writeIfMissing(path.join(dir, 'routes', 'adminRoutes.js'), routeContent)) created.push('routes/adminRoutes.js');

    this.wireIntoIndex(
      dir,
      "const adminRoutes = require('./routes/adminRoutes');",
      "app.use('/api/admin', adminRoutes);"
    );

    return created;

  }

  async generate(projectDir, instruction) {

    const template = this.detectTemplate(instruction);

    if (!template) {
      return [];
    }

    switch (template) {
      case 'todo': return this.generateTodo(projectDir);
      case 'blog': return this.generateBlog(projectDir);
      case 'admin': return this.generateAdmin(projectDir);
      default: return [];
    }

  }

}

module.exports = CodeGenerator;
