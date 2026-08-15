'use strict';

const fs = require('fs');
const path = require('path');

class ProjectManager {

  constructor() {

    this.root = path.join(process.cwd(), 'projects');
    fs.mkdirSync(this.root, { recursive: true });

    this.stateFile = path.join(process.cwd(), 'project', 'current.json');

    this.current = this.loadCurrent();

  }

  // ---------- Kalıcılık ----------

  loadCurrent() {

    try {

      if (!fs.existsSync(this.stateFile)) return null;

      const data = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));

      if (data && data.current && fs.existsSync(data.current)) {
        return data.current;
      }

      return null;

    } catch (e) {
      return null;
    }

  }

  saveCurrent() {

    try {
      fs.writeFileSync(
        this.stateFile,
        JSON.stringify({ current: this.current }, null, 2)
      );
    } catch (e) {
      console.log('⚠️ Aktif proje bilgisi kaydedilemedi:', e.message);
    }

  }

  // ---------- Mevcut davranış ----------

  create(name) {

    const dir = path.join(this.root, name);

    fs.mkdirSync(dir, { recursive: true });

    [
      'src',
      'public',
      'routes',
      'controllers',
      'models',
      'config'
    ].forEach(folder => {
      fs.mkdirSync(path.join(dir, folder), { recursive: true });
    });

    this.current = dir;
    this.saveCurrent();

    return dir;

  }

  getCurrent() {
    return this.current;
  }

  hasProject() {
    return this.current !== null;
  }

  setCurrent(dir) {

    if (!fs.existsSync(dir)) {
      throw new Error('Proje klasörü bulunamadı: ' + dir);
    }

    this.current = dir;
    this.saveCurrent();

  }

  // ---------- Yeni: proje listesi ----------

  detectProjectType(dir) {

    if (fs.existsSync(path.join(dir, 'vite.config.js'))) return 'react';
    if (fs.existsSync(path.join(dir, 'app.py'))) return 'flask';
    if (fs.existsSync(path.join(dir, 'main.py'))) return 'fastapi';
    if (fs.existsSync(path.join(dir, 'package.json'))) return 'express';

    return 'bilinmiyor';

  }

  listProjects() {

    const entries = fs.readdirSync(this.root, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();

    return entries.map((name, index) => {

      const dir = path.join(this.root, name);

      return {
        index: index + 1,
        name,
        dir,
        type: this.detectProjectType(dir),
        active: dir === this.current
      };

    });

  }

  selectByIndex(i) {

    const list = this.listProjects();
    const found = list.find(p => p.index === i);

    if (!found) {
      throw new Error(`${i} numaralı proje bulunamadı.`);
    }

    this.setCurrent(found.dir);

    return found;

  }

}

module.exports = ProjectManager;
