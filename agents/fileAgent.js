'use strict';

const fs = require('fs');
const path = require('path');

class FileAgent {

  resolveSafe(dir, relPath) {

    const target = path.join(dir, relPath);
    const normalizedDir = path.resolve(dir);
    const normalizedTarget = path.resolve(target);

    if (!normalizedTarget.startsWith(normalizedDir)) {
      return null;
    }

    return normalizedTarget;

  }

  listFiles(dir, subPath = '.') {

    const target = this.resolveSafe(dir, subPath);

    if (!target) {
      return { success: false, error: 'Güvenlik: proje dışına çıkılamaz.' };
    }

    if (!fs.existsSync(target)) {
      return { success: false, error: 'Klasör bulunamadı: ' + subPath };
    }

    try {

      const entries = fs.readdirSync(target, { withFileTypes: true })
        .filter(e => e.name !== 'node_modules' && e.name !== '.git' && e.name !== '.jarvis-backups' && e.name !== '.jarvis-backup')
        .map(e => ({
          name: e.name,
          type: e.isDirectory() ? 'dir' : 'file'
        }));

      return { success: true, entries };

    } catch (e) {
      return { success: false, error: e.message };
    }

  }

  readFile(dir, relPath) {

    const target = this.resolveSafe(dir, relPath);

    if (!target) {
      return { success: false, error: 'Güvenlik: proje dışına çıkılamaz.' };
    }

    if (!fs.existsSync(target)) {
      return { success: false, error: 'Dosya bulunamadı: ' + relPath };
    }

    try {

      const stat = fs.statSync(target);

      if (stat.isDirectory()) {
        return { success: false, error: relPath + ' bir dosya değil, klasör.' };
      }

      const content = fs.readFileSync(target, 'utf8');

      return { success: true, content };

    } catch (e) {
      return { success: false, error: e.message };
    }

  }

  backupBeforeChange(target) {

    if (!fs.existsSync(target)) return null;

    const dir = path.dirname(target);
    const backupsDir = path.join(dir, '.jarvis-backups');

    fs.mkdirSync(backupsDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupsDir, path.basename(target) + '.' + stamp + '.bak');

    fs.copyFileSync(target, backupPath);

    return backupPath;

  }

  writeFile(dir, relPath, content) {

    const target = this.resolveSafe(dir, relPath);

    if (!target) {
      return { success: false, error: 'Güvenlik: proje dışına çıkılamaz.' };
    }

    try {

      const backupPath = this.backupBeforeChange(target);

      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content != null ? content : '');

      return { success: true, backupPath };

    } catch (e) {
      return { success: false, error: e.message };
    }

  }

  deleteFile(dir, relPath) {

    const target = this.resolveSafe(dir, relPath);

    if (!target) {
      return { success: false, error: 'Güvenlik: proje dışına çıkılamaz.' };
    }

    if (!fs.existsSync(target)) {
      return { success: false, error: 'Dosya bulunamadı: ' + relPath };
    }

    try {

      const stat = fs.statSync(target);
      const backupPath = stat.isFile() ? this.backupBeforeChange(target) : null;

      if (stat.isDirectory()) {
        fs.rmSync(target, { recursive: true, force: true });
      } else {
        fs.unlinkSync(target);
      }

      return { success: true, backupPath };

    } catch (e) {
      return { success: false, error: e.message };
    }

  }

  createFolder(dir, relPath) {

    const target = this.resolveSafe(dir, relPath);

    if (!target) {
      return { success: false, error: 'Güvenlik: proje dışına çıkılamaz.' };
    }

    try {
      fs.mkdirSync(target, { recursive: true });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }

  }

  moveFile(dir, fromRel, toRel) {

    const source = this.resolveSafe(dir, fromRel);
    const dest = this.resolveSafe(dir, toRel);

    if (!source || !dest) {
      return { success: false, error: 'Güvenlik: proje dışına çıkılamaz.' };
    }

    if (!fs.existsSync(source)) {
      return { success: false, error: 'Kaynak bulunamadı: ' + fromRel };
    }

    try {

      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(source, dest);

      return { success: true };

    } catch (e) {
      return { success: false, error: e.message };
    }

  }

  searchInFiles(dir, query, maxResults = 20) {

    const ignoreDirs = new Set(['node_modules', '.git', '.jarvis-backups', '.jarvis-backup', 'dist', 'build']);
    const matches = [];

    const walk = (current) => {

      if (matches.length >= maxResults) return;

      let entries;

      try {
        entries = fs.readdirSync(current, { withFileTypes: true });
      } catch (e) {
        return;
      }

      for (const entry of entries) {

        if (matches.length >= maxResults) return;

        const fullPath = path.join(current, entry.name);

        if (entry.isDirectory()) {
          if (!ignoreDirs.has(entry.name)) {
            walk(fullPath);
          }
          continue;
        }

        try {

          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          lines.forEach((line, idx) => {

            if (matches.length >= maxResults) return;

            if (line.toLowerCase().includes(query.toLowerCase())) {
              matches.push({
                file: path.relative(dir, fullPath),
                line: idx + 1,
                text: line.trim().slice(0, 150)
              });
            }

          });

        } catch (e) {
          // ikili/okunamayan dosyaları atla
        }

      }

    };

    walk(dir);

    return { success: true, matches };

  }

  formatEntries(entries) {

    if (!entries || entries.length === 0) {
      return '(boş)';
    }

    return entries
      .map(e => (e.type === 'dir' ? '📁 ' : '📄 ') + e.name)
      .join('\n');

  }

  formatMatches(matches) {

    if (!matches || matches.length === 0) {
      return 'Eşleşme bulunamadı.';
    }

    return matches
      .map(m => `${m.file}:${m.line}  ${m.text}`)
      .join('\n');

  }

  async handleInstruction(dir, instruction, aiManager) {

    if (!dir) {
      return { success: false, error: 'Aktif proje yok.' };
    }

    if (!aiManager) {
      return { success: false, error: 'AI motoru bağlı değil.' };
    }

    const messages = [
      {
        role: 'system',
        content: 'Sen bir dosya yonetim asistanisin. Kullanicinin istegini analiz et ve SADECE JSON formatinda cevap ver, baska aciklama ekleme. Format: {"action": "list|read|create|delete|mkdir|move|search", "path": "", "content": "", "from": "", "to": "", "query": ""}. action=list icin path opsiyonel (bos ise kok dizin). action=read/delete icin path zorunlu. action=create icin path ve content. action=mkdir icin path. action=move icin from ve to. action=search icin query.'
      },
      {
        role: 'user',
        content: instruction
      }
    ];

    let parsed;

    try {

      const raw = await aiManager.chat(messages, { max_tokens: 200, temperature: 0.1 });
      const cleaned = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);

    } catch (e) {
      return { success: false, error: 'İstek anlaşılamadı: ' + e.message };
    }

    switch (parsed.action) {

      case 'list': {
        const result = this.listFiles(dir, parsed.path || '.');
        return Object.assign({ action: 'list' }, result, { formatted: result.success ? this.formatEntries(result.entries) : null });
      }

      case 'read': {
        const result = this.readFile(dir, parsed.path);
        return Object.assign({ action: 'read' }, result);
      }

      case 'create': {
        const result = this.writeFile(dir, parsed.path, parsed.content || '');
        return Object.assign({ action: 'create' }, result);
      }

      case 'delete': {
        const result = this.deleteFile(dir, parsed.path);
        return Object.assign({ action: 'delete' }, result);
      }

      case 'mkdir': {
        const result = this.createFolder(dir, parsed.path);
        return Object.assign({ action: 'mkdir' }, result);
      }

      case 'move': {
        const result = this.moveFile(dir, parsed.from, parsed.to);
        return Object.assign({ action: 'move' }, result);
      }

      case 'search': {
        const result = this.searchInFiles(dir, parsed.query || '');
        return Object.assign({ action: 'search' }, result, { formatted: this.formatMatches(result.matches) });
      }

      default:
        return { success: false, error: 'Bilinmeyen işlem: ' + parsed.action };

    }

  }

}

module.exports = FileAgent;
