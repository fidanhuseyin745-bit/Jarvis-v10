'use strict';

const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(process.cwd(), 'memory');
const STORE_FILE = path.join(STORE_DIR, 'context.json');
const MAX_TURNS = 20;

class ContextManager {

  constructor() {

    fs.mkdirSync(STORE_DIR, { recursive: true });

    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify({
        lastProject: null,
        lastAction: null,
        turns: []
      }, null, 2));
    }

    this.state = this._load();

  }

  _load() {

    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const data = JSON.parse(raw);
      return {
        lastProject: data.lastProject || null,
        lastAction: data.lastAction || null,
        turns: Array.isArray(data.turns) ? data.turns : []
      };
    } catch (e) {
      return { lastProject: null, lastAction: null, turns: [] };
    }

  }

  _persist() {

    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.log('⚠️ Context kaydedilemedi:', e.message);
    }

  }

  recordTurn(input, action, project) {

    this.state.turns.push({
      timestamp: new Date().toISOString(),
      input,
      action,
      project: project || null
    });

    if (this.state.turns.length > MAX_TURNS) {
      this.state.turns = this.state.turns.slice(-MAX_TURNS);
    }

    this.state.lastAction = action;

    if (project) {
      this.state.lastProject = project;
    }

    this._persist();

  }

  getLastProject() {
    return this.state.lastProject;
  }

  getRecentTurns(limit = 5) {
    return this.state.turns.slice(-limit);
  }

  resolveReference(input) {

    const text = input.toLowerCase();

    const referencesPrevious = [
      'onceki proje', 'önceki proje', 'o projeye', 'bir onceki proje', 'bir önceki proje',
      'devam et', 'kaldigimiz yerden', 'kaldığımız yerden', 'ayni projeye', 'aynı projeye'
    ].some(kw => text.includes(kw));

    if (referencesPrevious && this.state.lastProject) {
      return this.state.lastProject;
    }

    return null;

  }

  summary(limit = 5) {

    const turns = this.getRecentTurns(limit);

    if (turns.length === 0) {
      return 'Henüz bir geçmiş yok.';
    }

    return turns
      .map(t => {
        const when = t.timestamp.slice(0, 16).replace('T', ' ');
        return `[${when}] (${t.action || 'islem'}) ${t.input}`;
      })
      .join('\n');

  }

}

module.exports = ContextManager;
