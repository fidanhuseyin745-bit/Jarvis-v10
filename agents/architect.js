'use strict';

class Architect {

  plan(prompt) {

    const text = prompt.toLowerCase();

    const modules = [];

    if (text.includes("api")) modules.push("express");
    if (text.includes("blog")) modules.push("sqlite");
    if (text.includes("jwt")) modules.push("jwt");
    if (text.includes("login")) modules.push("login");
    if (text.includes("admin")) modules.push("jwt");
    if (text.includes("swagger")) modules.push("swagger");
    if (text.includes("docker")) modules.push("docker");
    if (text.includes("oauth")) modules.push("oauth");

    return [...new Set(modules)];

  }

  async planWithAI(prompt, aiManager) {

    if (!aiManager) {
      return { projectType: null, modules: this.plan(prompt) };
    }

    const messages = [
      {
        role: 'system',
        content: 'Sen bir yazılım mimarisin. Kullanıcının isteğini analiz et ve SADECE JSON formatında cevap ver, başka hiçbir açıklama, önsöz veya kod bloğu işareti ekleme. Format: {"projectType": "express", "modules": ["jwt","docker"]}. projectType SADECE şunlardan biri olmalı: express, react, vue, next.js, flask, fastapi. Eğer istek bu türlerden hiçbirine net şekilde uymuyorsa (örneğin oyun, masaüstü uygulama gibi) projectType alanına en yakın olanı (genellikle "express") yaz. modules alanı sadece şu değerlerden oluşabilir: jwt, login, sqlite, postgres, mongo, oauth, swagger, docker, test. İhtiyaç olmayan modülleri ekleme.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {

      const raw = await aiManager.chat(messages, { max_tokens: 200, temperature: 0.1 });

      const cleaned = raw.replace(/```json|```/g, '').trim();

      const parsed = JSON.parse(cleaned);

      const validTypes = ['express', 'react', 'vue', 'next.js', 'flask', 'fastapi'];
      const validModules = ['jwt', 'login', 'sqlite', 'postgres', 'mongo', 'oauth', 'swagger', 'docker', 'test'];

      const projectType = validTypes.includes(parsed.projectType) ? parsed.projectType : 'express';

      const modules = Array.isArray(parsed.modules)
        ? [...new Set(parsed.modules.filter(m => validModules.includes(m)))]
        : [];

      return { projectType, modules };

    } catch (e) {

      console.log('⚠️ AI planlama başarısız oldu, kelime tabanlı sisteme geçiliyor.');
      return { projectType: null, modules: this.plan(prompt) };

    }

  }

}

module.exports = Architect;
