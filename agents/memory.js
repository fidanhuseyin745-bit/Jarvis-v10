'use strict';

const fs = require('fs');
const path = require('path');

const GLOBAL_MEMORY_DIR = path.join(process.cwd(), 'memory');
const GLOBAL_MEMORY_FILE = path.join(GLOBAL_MEMORY_DIR, 'memory.json');
const MAX_ENTRIES = 200;

class Memory {

  constructor(contextManager) {

    this.contextManager = contextManager || null;

    fs.mkdirSync(GLOBAL_MEMORY_DIR, { recursive: true });

    if (!fs.existsSync(GLOBAL_MEMORY_FILE)) {
      fs.writeFileSync(GLOBAL_MEMORY_FILE, JSON.stringify({ entries: [] }, null, 2));
    }

    this.history = this._loadAll();

  }

  _loadAll() {

    try {

      const raw = fs.readFileSync(GLOBAL_MEMORY_FILE, 'utf8');
      const data = JSON.parse(raw);

      if (!data || !Array.isArray(data.entries)) {
        return [];
      }

      return data.entries;

    } catch (e) {
      return [];
    }

  }

  _persist() {

    try {

      const trimmed = this.history.slice(-MAX_ENTRIES);
      this.history = trimmed;

      fs.writeFileSync(
        GLOBAL_MEMORY_FILE,
        JSON.stringify({ entries: trimmed }, null, 2)
      );

    } catch (e) {
      console.log('⚠️ Hafıza kaydedilemedi:', e.message);
    }

  }

  add(item) {

    const entry = Object.assign(
      {
        timestamp: new Date().toISOString(),
        project: item && item.project ? item.project : null
      },
      item
    );

    this.history.push(entry);
    this._persist();

    if (this.contextManager && typeof this.contextManager.recordTurn === 'function') {
      try {
        this.contextManager.recordTurn(entry.input || '', entry.action || null, entry.project || null);
      } catch (e) {
        // context guncellenemedi, sessizce gec
      }
    }

    return entry;

  }

  last() {
    return this.history[this.history.length - 1] || null;
  }

  list() {
    return this.history;
  }

  listByProject(projectPath) {

    if (!projectPath) return [];

    return this.history.filter(h => h.project === projectPath);

  }

  recentSummary(projectPath, limit = 5) {

    const scoped = projectPath ? this.listByProject(projectPath) : this.history;

    return scoped
      .slice(-limit)
      .map(h => {

        const when = h.timestamp ? h.timestamp.slice(0, 16).replace('T', ' ') : '';
        const action = h.action || 'islem';
        const detail = h.input || h.summary || '';

        let status = '';

        if (h.action === 'patch_project') {
          status = h.rolledBack ? ' [BASARISIZ - geri alindi]' : (h.success ? ' [basarili]' : '');
        } else if (h.action === 'generate_feature') {
          status = (h.created && h.created.length > 0) ? ' [olusturuldu: ' + h.created.join(', ') + ']' : ' [basarisiz]';
        }

        return `[${when}] ${action}: ${detail}${status}`;

      })
      .join('\n');

  }

  clear() {
    this.history = [];
    this._persist();
  }

}

module.exports = Memory;
