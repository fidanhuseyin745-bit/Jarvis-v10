'use strict';

class Orchestrator {

  constructor(core) {
    this.core = core;
  }

  async build(prompt) {

    console.log('🧠 Architect...');

    await this.core.architect.planWithAI(prompt, this.core.ai);

    console.log('💻 Coder...');

    await this.core.codeGenerator.generate(this.core.projects.getCurrent(), prompt);

    console.log('🔍 Reviewer...');

    const review = await this.core.reviewer.review(this.core.ai, ['project']);

    console.log(review);

    return true;

  }

  async route(input) {

    if (!this.core.ai) {
      console.log('🤖 AI motoru bağlı değil, yönlendirme yapılamıyor.');
      return false;
    }

    const messages = [
      {
        role: 'system',
        content: [
          'Sen bir komut yonlendirme asistanisin (orchestrator). Kullanicinin dogal dil istegini analiz et.',
          'SADECE JSON formatinda cevap ver, baska aciklama ekleme.',
          'Format: {"target": "auto_build|terminal|web_search|file_task|phone|chat", "reply": ""}',
          '',
          'target=auto_build: yeni proje olusturma, ozellik ekleme, kod duzeltme istekleri (orn: "blog api olustur", "todo api yap").',
          'target=terminal: bash/terminal komutlari, sistem islemleri (orn: "process listele", "disk kullanimini goster").',
          'target=web_search: internetten arama, guncel bilgi istekleri (orn: "youtube da lofi ara", "en son haberler").',
          'target=file_task: proje dosyalarini listeleme/okuma/silme/arama (orn: "dosyalari listele", "kodda hata ara").',
          'target=phone: telefonu kontrol etme, uygulama acma, bildirim, arama (orn: "whatsapp ac", "bildirim gonder").',
          'target=chat: genel sohbet, bilgi sorusu, siniflandirilamayan istekler. reply alanina Turkce kisa cevap yaz.'
        ].join('\n')
      },
      {
        role: 'user',
        content: input
      }
    ];

    try {

      const raw = await this.core.ai.chat(messages, { max_tokens: 150, temperature: 0.1 });
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return parsed;

    } catch (e) {
      console.log('⚠️ Yönlendirme sırasında hata:', e.message);
      return false;
    }

  }

}

module.exports = Orchestrator;
