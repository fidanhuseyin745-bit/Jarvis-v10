'use strict';

const { execSync } = require('child_process');

class VoiceAgent {

  listen() {

    try {

      const result = execSync('termux-speech-to-text', {
        encoding: 'utf8',
        timeout: 30000
      });

      const text = result.trim();

      if (!text) {
        return { success: false, text: '', error: 'Ses algılanamadı.' };
      }

      return { success: true, text, error: null };

    } catch (e) {
      return { success: false, text: '', error: e.message };
    }

  }

  speak(text) {

    if (!text) return { success: false, error: 'Metin boş.' };

    try {

      const safeText = String(text)
        .replace(/"/g, "'")
        .slice(0, 500);

      execSync(`termux-tts-speak "${safeText}"`, { timeout: 15000 });

      return { success: true, error: null };

    } catch (e) {
      return { success: false, error: e.message };
    }

  }

}

module.exports = VoiceAgent;
