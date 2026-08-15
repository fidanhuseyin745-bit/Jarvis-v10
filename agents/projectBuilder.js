'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectBuilder {

  constructor(projects) {
    this.projects = projects;
  }

  // ---------- Yardımcılar ----------

  detectType(dir) {

    // Öncelik: package.json içindeki gerçek bağımlılıklara bakmak,
    // sadece dosya varlığına bakmaktan daha güvenilirdir.
    // Bir klasörde birden fazla framework'e ait dosya karışmışsa bile
    // (örn. hem next.config.js hem routes/ klasörü), gerçek proje
    // tipini bağımlılıklardan doğru tespit ederiz.

    const pkgPath = path.join(dir, 'package.json');

    if (fs.existsSync(pkgPath)) {

      let pkg;

      try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      } catch (e) {
        pkg = null;
      }

      if (pkg) {

        const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);

        if (deps.next) return 'nextjs';
        if (deps.vue) return 'vue';
        if (deps.react && fs.existsSync(path.join(dir, 'vite.config.js'))) return 'react';
        if (deps.express) return 'express';

      }

    }

    // package.json yoksa veya belirsizse dosya varlığına geri dön.

    if (fs.existsSync(path.join(dir, 'vite.config.js'))) {
      if (fs.existsSync(path.join(dir, 'src', 'App.vue'))) return 'vue';
      if (fs.existsSync(path.join(dir, 'src', 'App.jsx'))) return 'react';
      return 'react';
    }

    if (fs.existsSync(path.join(dir, 'next.config.js'))) return 'nextjs';
    if (fs.existsSync(path.join(dir, 'app.py'))) return 'flask';
    if (fs.existsSync(path.join(dir, 'main.py'))) return 'fastapi';
    if (fs.existsSync(pkgPath)) return 'express';

    throw new Error('Proje türü tanınamadı.');

  }

  readPkg(dir) {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  }

  writePkg(dir, pkg) {
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
  }

  npmInstall(dir, packages) {

    console.log(`📦 Kuruluyor: ${packages.join(', ')}`);

    try {
      execSync(`npm install ${packages.join(' ')}`, { cwd: dir, stdio: 'inherit' });
      console.log('✅ Paketler kuruldu.');
    } catch (e) {
      console.log('❌ npm install başarısız:', e.message);
      throw e;
    }

  }

  pipInstall(dir, packages) {

    console.log(`📦 Kuruluyor: ${packages.join(', ')}`);

    try {
      execSync(`pip install ${packages.join(' ')}`, { cwd: dir, stdio: 'inherit' });
      console.log('✅ Paketler kuruldu.');
    } catch (e) {
      console.log('❌ pip install başarısız:', e.message);
      throw e;
    }

  }

  ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
  }

  appendEnv(dir, line) {

    const envPath = path.join(dir, '.env');
    const key = line.split('=')[0];

    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      if (!content.includes(key)) {
        fs.appendFileSync(envPath, line + '\n');
      }
    } else {
      fs.writeFileSync(envPath, line + '\n');
    }

  }

  // ---------- Proje oluşturma ----------

  build(prompt) {

    const dir = this.projects.create('project-' + Date.now());

    const p = prompt.toLowerCase();

    if (p.includes('next.js') || p.includes('nextjs')) {
      this.scaffoldNext(dir);
    } else if (p.includes('vue')) {
      this.scaffoldVue(dir);
    } else if (p.includes('react')) {
      this.scaffoldReact(dir);
    } else if (p.includes('flask')) {
      this.scaffoldFlask(dir);
    } else if (p.includes('fastapi')) {
      this.scaffoldFastAPI(dir);
    } else {
      this.scaffoldExpress(dir);
    }

    fs.writeFileSync(
      path.join(dir, 'README.md'),
      fs.readFileSync(path.join(__dirname, '..', 'templates', 'readme.md'), 'utf8')
    );

    fs.writeFileSync(
      path.join(dir, '.gitignore'),
      fs.readFileSync(path.join(__dirname, '..', 'templates', 'gitignore'), 'utf8')
    );

    console.log('✅ Proje oluşturuldu:', dir);

  }

  scaffoldExpress(dir) {

    const src = path.join(__dirname, '..', 'templates', 'express.js');
    const code = fs.readFileSync(src, 'utf8');

    fs.writeFileSync(path.join(dir, 'index.js'), code);

    this.writePkg(dir, {
      name: 'jarvis-app',
      version: '1.0.0',
      main: 'index.js',
      scripts: { start: 'node index.js' },
      dependencies: { express: '^5.1.0' }
    });

    console.log('📦 Bağımlılıklar kuruluyor (npm install)...');

    try {
      execSync('npm install', { cwd: dir, stdio: 'inherit' });
      console.log('✅ Bağımlılıklar kuruldu.');
    } catch (e) {
      console.log('❌ npm install başarısız:', e.message);
    }

  }

  scaffoldReact(dir) {

    const appCode = fs.readFileSync(path.join(__dirname, '..', 'templates', 'react.js'), 'utf8');

    this.ensureDir(path.join(dir, 'src'));

    fs.writeFileSync(path.join(dir, 'src', 'App.jsx'), appCode);

    fs.writeFileSync(path.join(dir, 'src', 'main.jsx'), `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`);

    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jarvis React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);

    fs.writeFileSync(path.join(dir, 'vite.config.js'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: true }
});
`);

    this.writePkg(dir, {
      name: 'jarvis-react-app',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
      devDependencies: { vite: '^6.3.5', '@vitejs/plugin-react': '^4.3.4' }
    });

    console.log('📦 Bağımlılıklar kuruluyor (npm install)...');

    try {
      execSync('npm install', { cwd: dir, stdio: 'inherit' });
      console.log('✅ Bağımlılıklar kuruldu.');
    } catch (e) {
      console.log('❌ npm install başarısız:', e.message);
    }

  }

  scaffoldVue(dir) {

    this.ensureDir(path.join(dir, 'src'));

    fs.writeFileSync(path.join(dir, 'src', 'App.vue'), `<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div style="padding: 30px;">
    <h1>Jarvis Vue</h1>
    <button @click="count++">Count {{ count }}</button>
  </div>
</template>
`);

    fs.writeFileSync(path.join(dir, 'src', 'main.js'), `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
`);

    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jarvis Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`);

    fs.writeFileSync(path.join(dir, 'vite.config.js'), `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: { host: true }
});
`);

    this.writePkg(dir, {
      name: 'jarvis-vue-app',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: { vue: '^3.4.0' },
      devDependencies: { vite: '^6.3.5', '@vitejs/plugin-vue': '^5.1.0' }
    });

    console.log('📦 Bağımlılıklar kuruluyor (npm install)...');

    try {
      execSync('npm install', { cwd: dir, stdio: 'inherit' });
      console.log('✅ Bağımlılıklar kuruldu.');
    } catch (e) {
      console.log('❌ npm install başarısız:', e.message);
    }

  }

  scaffoldNext(dir) {

    this.ensureDir(path.join(dir, 'pages'));

    fs.writeFileSync(path.join(dir, 'pages', 'index.js'), `export default function Home() {
  return (
    <div style={{ padding: 30 }}>
      <h1>Jarvis Next.js</h1>
      <p>Proje başarıyla oluşturuldu.</p>
    </div>
  );
}
`);

    fs.writeFileSync(path.join(dir, 'next.config.js'), `/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
`);

    this.writePkg(dir, {
      name: 'jarvis-next-app',
      version: '1.0.0',
      private: true,
      scripts: { dev: 'next dev', build: 'next build', start: 'next dev' },
      dependencies: { next: '^14.2.0', react: '^18.3.1', 'react-dom': '^18.3.1' }
    });

    console.log('⚠️ UYARI: Next.js, Android/Termux ortamında ÇALIŞTIRILAMAZ.');
    console.log('   Sebep: Next.js\'in SWC derleyicisi için Android (arm64) native paketi yayınlanmıyor.');
    console.log('   Proje dosyaları oluşturulacak ama "çalıştır" komutu bu projede başarısız olacaktır.');
    console.log('   Bu projeyi bir bilgisayarda (Windows/Mac/Linux) çalıştırabilirsin.');
    console.log('📦 Bağımlılıklar kuruluyor (npm install)...');

    try {
      execSync('npm install', { cwd: dir, stdio: 'inherit' });
      console.log('✅ Bağımlılıklar kuruldu (ancak bu cihazda çalıştırılamaz).');
    } catch (e) {
      console.log('❌ npm install başarısız:', e.message);
    }

  }

  scaffoldFlask(dir) {

    const src = path.join(__dirname, '..', 'templates', 'flask.py');
    const code = fs.readFileSync(src, 'utf8');

    fs.writeFileSync(path.join(dir, 'app.py'), code);
    fs.writeFileSync(path.join(dir, 'requirements.txt'), 'flask\n');

    console.log('📦 Bağımlılıklar kuruluyor (pip install)...');

    try {
      execSync('pip install -r requirements.txt', { cwd: dir, stdio: 'inherit' });
      console.log('✅ Bağımlılıklar kuruldu.');
    } catch (e) {
      console.log('❌ pip install başarısız:', e.message);
    }

  }

  scaffoldFastAPI(dir) {

    const src = path.join(__dirname, '..', 'templates', 'fastapi.py');
    const code = fs.readFileSync(src, 'utf8');

    fs.writeFileSync(path.join(dir, 'main.py'), code);
    fs.writeFileSync(path.join(dir, 'requirements.txt'), 'fastapi<0.100\nuvicorn\npydantic<2\n');

    console.log('📦 Bağımlılıklar kuruluyor (pip install)...');

    try {
      execSync('pip install -r requirements.txt', { cwd: dir, stdio: 'inherit' });
      console.log('✅ Bağımlılıklar kuruldu.');
    } catch (e) {
      console.log('❌ pip install başarısız:', e.message);
    }

  }

  // ---------- Login sistemi ----------

  addLogin() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ Login sistemi şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['bcryptjs']);

    this.ensureDir(path.join(dir, 'routes'));
    this.ensureDir(path.join(dir, 'controllers'));
    this.ensureDir(path.join(dir, 'config'));

    const usersFile = path.join(dir, 'config', 'users.json');
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    }

    fs.writeFileSync(path.join(dir, 'controllers', 'authController.js'), `'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '..', 'config', 'users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function register(req, res) {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username ve password zorunlu.' });
  }

  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Kullanıcı zaten mevcut.' });
  }

  const hashed = await bcrypt.hash(password, 10);

  users.push({ username, password: hashed });
  writeUsers(users);

  return res.status(201).json({ message: 'Kayıt başarılı.' });

}

async function login(req, res) {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username ve password zorunlu.' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
  }

  return res.status(200).json({ message: 'Giriş başarılı.', username: user.username });

}

module.exports = { register, login };
`);

    fs.writeFileSync(path.join(dir, 'routes', 'auth.js'), `'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
`);

    this.patchIndexJs(dir, [
      { search: "const express=require('express');", insert: "\nconst authRoutes = require('./routes/auth');" },
      { search: "const express = require('express');", insert: "\nconst authRoutes = require('./routes/auth');" }
    ], "app.use('/auth', authRoutes);");

    console.log('✅ Login sistemi eklendi: POST /auth/register, POST /auth/login');

  }

  // ---------- JWT ----------

  addJWT() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ JWT şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['jsonwebtoken']);

    this.ensureDir(path.join(dir, 'middlewares'));

    this.appendEnv(dir, 'JWT_SECRET=change_this_secret_in_production');

    fs.writeFileSync(path.join(dir, 'middlewares', 'authMiddleware.js'), `'use strict';

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function verifyToken(req, res, next) {

  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token bulunamadı.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }

}

module.exports = { signToken, verifyToken };
`);

    console.log('✅ JWT middleware eklendi: middlewares/authMiddleware.js');

  }

  // ---------- SQLite ----------

  addSQLite() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ SQLite şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.ensureDir(path.join(dir, 'config'));

    fs.writeFileSync(path.join(dir, 'config', 'db.js'), `'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new DatabaseSync(dbPath);

db.exec(\`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
\`);

module.exports = db;
`);

    console.log('✅ SQLite eklendi: config/db.js (node:sqlite kullanılıyor, native derleme gerekmez)');

  }

  // ---------- PostgreSQL ----------

  addPostgres() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ PostgreSQL şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['pg']);

    this.ensureDir(path.join(dir, 'config'));

    this.appendEnv(dir, 'DATABASE_URL=postgres://kullanici:sifre@localhost:5432/veritabani_adi');

    fs.writeFileSync(path.join(dir, 'config', 'postgres.js'), `'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (err) => {
  console.error('Beklenmeyen PostgreSQL hatası:', err.message);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
`);

    console.log('✅ PostgreSQL bağlantısı eklendi: config/postgres.js');
    console.log('ℹ️ .env dosyasındaki DATABASE_URL değerini kendi sunucu bilgilerinle güncellemen gerekiyor.');
    console.log('ℹ️ Not: Bu, bağlantı kodudur. PostgreSQL sunucusunun ayrıca kurulu/çalışır olması gerekir.');

  }

  // ---------- MongoDB ----------

  addMongo() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ MongoDB şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['mongodb']);

    this.ensureDir(path.join(dir, 'config'));

    this.appendEnv(dir, 'MONGO_URL=mongodb://localhost:27017/veritabani_adi');

    fs.writeFileSync(path.join(dir, 'config', 'mongo.js'), `'use strict';

const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/veritabani_adi';

const client = new MongoClient(url);

let db = null;

async function connectMongo() {

  if (db) return db;

  await client.connect();
  db = client.db();

  console.log('✅ MongoDB bağlantısı kuruldu.');

  return db;

}

module.exports = { connectMongo, client };
`);

    console.log('✅ MongoDB bağlantısı eklendi: config/mongo.js');
    console.log('ℹ️ .env dosyasındaki MONGO_URL değerini kendi sunucu bilgilerinle güncellemen gerekiyor.');
    console.log('ℹ️ Kullanım: const { connectMongo } = require("./config/mongo"); const db = await connectMongo();');

  }

  // ---------- Tailwind ----------

  addTailwind() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'react' && type !== 'vue') {
      console.log('⚠️ Tailwind şu an sadece React ve Vue projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['-D', 'tailwindcss', '@tailwindcss/vite']);

    const viteConfigPath = path.join(dir, 'vite.config.js');
    let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

    if (!viteConfig.includes('@tailwindcss/vite')) {
      viteConfig = `import tailwindcss from '@tailwindcss/vite';\n` + viteConfig;
      viteConfig = viteConfig.replace(/plugins:\s*\[/, 'plugins: [tailwindcss(), ');
      fs.writeFileSync(viteConfigPath, viteConfig);
    }

    this.ensureDir(path.join(dir, 'src'));

    const cssPath = path.join(dir, 'src', 'index.css');
    const importLine = '@import "tailwindcss";\n';

    if (fs.existsSync(cssPath)) {
      const content = fs.readFileSync(cssPath, 'utf8');
      if (!content.includes('@import "tailwindcss"')) {
        fs.writeFileSync(cssPath, importLine + content);
      }
    } else {
      fs.writeFileSync(cssPath, importLine);
    }

    const mainFile = type === 'vue' ? 'main.js' : 'main.jsx';
    const mainPath = path.join(dir, 'src', mainFile);

    if (fs.existsSync(mainPath)) {
      let mainContent = fs.readFileSync(mainPath, 'utf8');
      if (!mainContent.includes("./index.css")) {
        mainContent = `import './index.css';\n` + mainContent;
        fs.writeFileSync(mainPath, mainContent);
      }
    }

    console.log('✅ Tailwind CSS eklendi (Vite plugin ile).');

  }

  // ---------- Docker ----------

  addDocker() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    let dockerfile = '';
    let dockerignore = 'node_modules\n.git\n.env\n';

    if (type === 'express') {

      dockerfile = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
`;

    } else if (type === 'react' || type === 'vue') {

      dockerfile = `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

    } else if (type === 'nextjs') {

      dockerfile = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
`;

    } else if (type === 'flask') {

      dockerfile = `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
`;
      dockerignore = '__pycache__\n.git\n.env\nvenv\n';

    } else if (type === 'fastapi') {

      dockerfile = `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
      dockerignore = '__pycache__\n.git\n.env\nvenv\n';

    }

    fs.writeFileSync(path.join(dir, 'Dockerfile'), dockerfile);
    fs.writeFileSync(path.join(dir, '.dockerignore'), dockerignore);

    console.log('✅ Docker desteği eklendi: Dockerfile, .dockerignore');

  }

  // ---------- Docker Compose ----------

  addDockerCompose() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (!fs.existsSync(path.join(dir, 'Dockerfile'))) {
      console.log('⚠️ Önce "docker ekle" komutuyla Dockerfile oluşturmalısın.');
      return;
    }

    const hasPostgres = fs.existsSync(path.join(dir, 'config', 'postgres.js'));
    const hasMongo = fs.existsSync(path.join(dir, 'config', 'mongo.js'));

    let services = `  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:`;

    let extraServices = '';
    let dependsList = [];

    if (hasPostgres) {

      dependsList.push('      - postgres');

      extraServices += `

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: kullanici
      POSTGRES_PASSWORD: sifre
      POSTGRES_DB: veritabani_adi
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data`;

    }

    if (hasMongo) {

      dependsList.push('      - mongo');

      extraServices += `

  mongo:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db`;

    }

    if (dependsList.length === 0) {
      services = services.replace('    depends_on:', '');
    } else {
      services += '\n' + dependsList.join('\n');
    }

    let volumesBlock = '';
    if (hasPostgres || hasMongo) {
      volumesBlock = '\nvolumes:';
      if (hasPostgres) volumesBlock += '\n  postgres_data:';
      if (hasMongo) volumesBlock += '\n  mongo_data:';
    }

    const compose = `version: '3.8'

services:
${services}${extraServices}
${volumesBlock}
`;

    fs.writeFileSync(path.join(dir, 'docker-compose.yml'), compose);

    console.log('✅ docker-compose.yml oluşturuldu.');

    if (hasPostgres || hasMongo) {
      console.log('ℹ️ Veritabanı servisleri de dahil edildi (' + [hasPostgres && 'PostgreSQL', hasMongo && 'MongoDB'].filter(Boolean).join(', ') + ').');
    }

  }

  // ---------- Swagger ----------

  addSwagger() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ Swagger şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['swagger-ui-express', 'swagger-jsdoc']);

    this.ensureDir(path.join(dir, 'config'));

    fs.writeFileSync(path.join(dir, 'config', 'swagger.js'), `'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jarvis App API',
      version: '1.0.0',
      description: 'Otomatik oluşturulan API dokümantasyonu'
    }
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
`);

    this.patchIndexJs(dir, [
      { search: "const express=require('express');", insert: "\nconst swaggerUi = require('swagger-ui-express');\nconst swaggerSpec = require('./config/swagger');" },
      { search: "const express = require('express');", insert: "\nconst swaggerUi = require('swagger-ui-express');\nconst swaggerSpec = require('./config/swagger');" }
    ], "app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));");

    console.log('✅ Swagger eklendi: /api-docs adresinden erişilebilir.');

  }

  // ---------- Helmet (güvenlik header'ları) ----------

  
addCors() {

  const dir = this.projects.getCurrent();
  this.npmInstall(dir, ['cors']);

  this.patchIndexJs(dir, [
    { search: "const express=require('express');", insert: "\nconst cors = require('cors');" },
    { search: "const express = require('express');", insert: "\nconst cors = require('cors');" }
  ]);

  this.patchIndexJs(dir, [
    { search: "app.use(express.json());", insert: "\napp.use(cors());" }
  ]);

  console.log("✅ CORS eklendi.");

}

addHelmet() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ Helmet şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['helmet']);

    this.patchIndexJs(dir, [
      { search: "const express=require('express');", insert: "\nconst helmet = require('helmet');" },
      { search: "const express = require('express');", insert: "\nconst helmet = require('helmet');" }
    ], "app.use(helmet());");

    console.log('✅ Helmet eklendi: güvenlik HTTP header\'ları otomatik ayarlanıyor.');

  }

  // ---------- Rate Limit ----------

  addRateLimit() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ Rate limit şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['express-rate-limit']);

    this.patchIndexJs(dir, [
      { search: "const express=require('express');", insert: "\nconst rateLimit = require('express-rate-limit');" },
      { search: "const express = require('express');", insert: "\nconst rateLimit = require('express-rate-limit');" }
    ], `const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.' });
app.use(limiter);`);

    console.log('✅ Rate limit eklendi: 15 dakikada IP başına en fazla 100 istek.');

  }

  // ---------- OAuth (Google - iskelet) ----------

  addOAuth() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type !== 'express') {
      console.log('⚠️ OAuth şu an sadece Express projelerinde destekleniyor.');
      return;
    }

    this.npmInstall(dir, ['passport', 'passport-google-oauth20', 'express-session']);

    this.ensureDir(path.join(dir, 'config'));

    this.appendEnv(dir, 'GOOGLE_CLIENT_ID=buraya_google_client_id_yaz');
    this.appendEnv(dir, 'GOOGLE_CLIENT_SECRET=buraya_google_client_secret_yaz');
    this.appendEnv(dir, 'SESSION_SECRET=change_this_session_secret');

    fs.writeFileSync(path.join(dir, 'config', 'passport.js'), `'use strict';

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Gerçek uygulamada burada kullanıcıyı veritabanında arayıp/oluşturup done(null, user) çağrılmalı.
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
`);

    fs.writeFileSync(path.join(dir, 'routes', 'oauth.js').replace('routes', fs.existsSync(path.join(dir, 'routes')) ? 'routes' : '.'), '');

    this.ensureDir(path.join(dir, 'routes'));

    fs.writeFileSync(path.join(dir, 'routes', 'oauth.js'), `'use strict';

const express = require('express');
const passport = require('../config/passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.json({ message: 'Google ile giriş başarılı.', user: req.user });
  }
);

module.exports = router;
`);

    this.patchIndexJs(dir, [
      { search: "const express=require('express');", insert: "\nconst session = require('express-session');\nconst passport = require('./config/passport');\nconst oauthRoutes = require('./routes/oauth');" },
      { search: "const express = require('express');", insert: "\nconst session = require('express-session');\nconst passport = require('./config/passport');\nconst oauthRoutes = require('./routes/oauth');" }
    ], `app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', oauthRoutes);`);

    console.log('✅ Google OAuth iskeleti eklendi: GET /auth/google, GET /auth/google/callback');
    console.log('ℹ️ .env dosyasındaki GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET değerlerini Google Cloud Console\'dan almalısın.');

  }

  // ---------- Test ----------

  addTest() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    if (type === 'express' || type === 'react' || type === 'vue' || type === 'nextjs') {

      this.npmInstall(dir, ['-D', 'jest']);

      const pkg = this.readPkg(dir);
      pkg.scripts = pkg.scripts || {};
      pkg.scripts.test = 'jest';
      this.writePkg(dir, pkg);

      this.ensureDir(path.join(dir, 'tests'));

      fs.writeFileSync(path.join(dir, 'tests', 'sample.test.js'), `test('temel toplama testi', () => {
  expect(1 + 1).toBe(2);
});
`);

      console.log('✅ Test altyapısı eklendi (Jest). Çalıştırmak için: npm test');

    } else if (type === 'flask' || type === 'fastapi') {

      this.pipInstall(dir, ['pytest']);

      this.ensureDir(path.join(dir, 'tests'));

      fs.writeFileSync(path.join(dir, 'tests', 'test_sample.py'), `def test_basic_addition():
    assert 1 + 1 == 2
`);

      console.log('✅ Test altyapısı eklendi (pytest). Çalıştırmak için: pytest');

    }

  }

  // ---------- GitHub Actions ----------

  addGithubActions() {

    const dir = this.projects.getCurrent();
    const type = this.detectType(dir);

    this.ensureDir(path.join(dir, '.github', 'workflows'));

    let workflow = '';

    if (type === 'express' || type === 'react' || type === 'vue' || type === 'nextjs') {

      const hasTest = fs.existsSync(path.join(dir, 'tests'));

      workflow = `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Node.js kurulumu
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Bağımlılıkları kur
        run: npm install
`;

      if (hasTest) {
        workflow += `
      - name: Testleri çalıştır
        run: npm test
`;
      }

    } else if (type === 'flask' || type === 'fastapi') {

      const hasTest = fs.existsSync(path.join(dir, 'tests'));

      workflow = `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Python kurulumu
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Bağımlılıkları kur
        run: pip install -r requirements.txt
`;

      if (hasTest) {
        workflow += `
      - name: Testleri çalıştır
        run: pytest
`;
      }

    }

    fs.writeFileSync(path.join(dir, '.github', 'workflows', 'ci.yml'), workflow);

    console.log('✅ GitHub Actions CI/CD eklendi: .github/workflows/ci.yml');

  }

  // ---------- Yardımcı: index.js içine otomatik satır ekleme ----------

  patchIndexJs(dir, requireInserts, useLine) {

    const indexPath = path.join(dir, 'index.js');

    if (!fs.existsSync(indexPath)) {
      console.log('⚠️ index.js bulunamadı, otomatik bağlama yapılamadı. Elle eklemen gerekebilir.');
      return;
    }

    let content = fs.readFileSync(indexPath, 'utf8');

    for (const { search, insert } of requireInserts) {
      if (content.includes(search) && !content.includes(insert.trim())) {
        content = content.replace(search, search + insert);
        break;
      }
    }

    if (!content.includes(useLine)) {
      if (content.includes('app.listen')) {
        content = content.replace('app.listen', useLine + '\n\napp.listen');
      } else {
        content += `\n${useLine}\n`;
      }
    }

    fs.writeFileSync(indexPath, content);

  }

  // ---------- AI destekli otomatik dosya yazma (yedekli) ----------

  backupFile(filePath) {

    if (!fs.existsSync(filePath)) return null;

    const dir = path.dirname(filePath);
    const backupsDir = path.join(dir, '.jarvis-backups');

    fs.mkdirSync(backupsDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupsDir, `${path.basename(filePath)}.${stamp}.bak`);

    fs.copyFileSync(filePath, backupPath);

    return backupPath;

  }

}

module.exports = ProjectBuilder;
