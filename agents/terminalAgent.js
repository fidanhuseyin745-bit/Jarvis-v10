'use strict';

const { execSync } = require('child_process');

const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\//,
  /rm\s+-rf\s+~/,
  /rm\s+-rf\s+\*/,
  /:\(\)\{.*\};:/,
  /mkfs\./,
  /dd\s+if=/,
  />\s*\/dev\/sd/,
  /chmod\s+-R\s+777\s+\//,
  /chown\s+-R.*\//,
  /reboot/,
  /shutdown/,
  /killall\s+-9/,
  /:\s*>\s*\/etc/
];

class TerminalAgent {

  isDangerous(cmd) {
    return DANGEROUS_PATTERNS.some(pattern => pattern.test(cmd));
  }

  execute(cmd, cwd) {

    if (this.isDangerous(cmd)) {
      return {
        success: false,
        blocked: true,
        output: '',
        error: 'Bu komut güvenlik nedeniyle engellendi: ' + cmd
      };
    }

    try {

      const output = execSync(cmd, {
        cwd: cwd || process.cwd(),
        encoding: 'utf8',
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 5
      });

      return { success: true, blocked: false, output: output || '(çıktı yok)', error: null };

    } catch (e) {

      const output = (e.stdout || '') + (e.stderr || '');

      return {
        success: false,
        blocked: false,
        output: output || '',
        error: e.message
      };

    }

  }

  async runNaturalLanguage(instruction, aiManager, cwd) {

    if (!aiManager) {
      return { success: false, blocked: false, output: '', error: 'AI motoru bağlı değil.' };
    }

    const messages = [
      {
        role: 'system',
        content: 'Sen bir terminal komut asistanisin. Kullanicinin dogal dil istegini TEK BIR bash komutuna cevir. SADECE JSON formatinda cevap ver, baska aciklama ekleme. Format: {"command": "ls -la"}. Eger istek zaten dogrudan bir komutsa oldugu gibi kullan. Tehlikeli, geri donusu olmayan komutlar (rm -rf /, mkfs, dd, format, shutdown, reboot) ONERME.'
      },
      {
        role: 'user',
        content: instruction
      }
    ];

    try {

      const raw = await aiManager.chat(messages, { max_tokens: 100, temperature: 0.1 });
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (!parsed.command) {
        return { success: false, blocked: false, output: '', error: 'AI geçerli bir komut üretmedi.' };
      }

      return this.execute(parsed.command, cwd);

    } catch (e) {
      return { success: false, blocked: false, output: '', error: 'İstek işlenirken hata: ' + e.message };
    }

  }

}

module.exports = TerminalAgent;
