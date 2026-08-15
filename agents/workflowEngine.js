'use strict';

const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(process.cwd(), 'memory');
const STORE_FILE = path.join(STORE_DIR, 'workflows.json');

class WorkflowEngine {

  constructor() {

    fs.mkdirSync(STORE_DIR, { recursive: true });

    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify({ workflows: {} }, null, 2));
    }

  }

  _load() {

    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const data = JSON.parse(raw);
      return (data && data.workflows) || {};
    } catch (e) {
      return {};
    }

  }

  _save(workflows) {

    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify({ workflows }, null, 2));
    } catch (e) {
      console.log('⚠️ Workflow kaydedilemedi:', e.message);
    }

  }

  list() {
    const workflows = this._load();
    return Object.keys(workflows);
  }

  get(name) {
    const workflows = this._load();
    return workflows[name] || null;
  }

  saveWorkflow(name, steps) {
    const workflows = this._load();
    workflows[name] = { steps, createdAt: new Date().toISOString() };
    this._save(workflows);
  }

  deleteWorkflow(name) {
    const workflows = this._load();
    if (!workflows[name]) return false;
    delete workflows[name];
    this._save(workflows);
    return true;
  }

  async planSteps(instruction, aiManager) {

    if (!aiManager) {
      return { name: null, steps: [] };
    }

    const messages = [
      {
        role: 'system',
        content: [
          'Sen bir is akisi (workflow) planlayicisisin. Kullanicinin cok adimli istegini analiz et ve adimlara bol.',
          'SADECE JSON formatinda cevap ver, baska aciklama ekleme.',
          'Format: {"name": "kisa-workflow-adi", "steps": [{"target": "terminal|web_search|file_task|auto_build|phone", "input": "adim aciklamasi"}]}',
          'target=terminal: bash komutlari.',
          'target=web_search: internetten arama.',
          'target=file_task: dosya listeleme/okuma/yazma/arama.',
          'target=auto_build: proje/kod olusturma veya duzenleme.',
          'target=phone: telefon islemleri.',
          'name alanina istekten kisa, tire ile ayrilmis bir isim uret (orn: "test-ve-rapor").',
          'En fazla 6 adim olustur.'
        ].join('\n')
      },
      {
        role: 'user',
        content: instruction
      }
    ];

    try {

      const raw = await aiManager.chat(messages, { max_tokens: 400, temperature: 0.2 });
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const validTargets = ['terminal', 'web_search', 'file_task', 'auto_build', 'phone'];

      const steps = Array.isArray(parsed.steps)
        ? parsed.steps.filter(s => s && validTargets.includes(s.target) && s.input)
        : [];

      const name = parsed.name && typeof parsed.name === 'string'
        ? parsed.name.trim().replace(/\s+/g, '-').toLowerCase()
        : ('workflow-' + Date.now());

      return { name, steps };

    } catch (e) {
      console.log('⚠️ Workflow planlanamadı:', e.message);
      return { name: null, steps: [] };
    }

  }

  async runSteps(steps, executors) {

    const results = [];

    for (let i = 0; i < steps.length; i++) {

      const step = steps[i];

      console.log(`\n▶️ Adım ${i + 1}/${steps.length} [${step.target}]: ${step.input}`);

      try {

        let result;

        switch (step.target) {

          case 'terminal':
            result = await executors.runTerminal(step.input);
            break;

          case 'web_search':
            result = await executors.runWebSearch(step.input);
            break;

          case 'file_task':
            result = await executors.runFileTask(step.input);
            break;

          case 'auto_build':
            result = await executors.autoBuild(step.input);
            break;

          case 'phone':
            result = await executors.phoneAssist(step.input);
            break;

          default:
            result = null;

        }

        results.push({ step: i + 1, target: step.target, success: true });

      } catch (e) {

        console.log('❌ Adım başarısız:', e.message);
        results.push({ step: i + 1, target: step.target, success: false, error: e.message });

      }

    }

    return results;

  }

}

module.exports = WorkflowEngine;
