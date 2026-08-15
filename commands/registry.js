'use strict';

const rules = [
  { action: 'help', keywords: ['yardım', 'help', 'komutlar'] },
  { action: 'status', keywords: ['durum', 'status'] },
  { action: 'git', keywords: ['git', 'git durumu', 'git status', 'git deposu', 'git init', 'git ekle', 'commit'] },

  { action: 'list_projects', keywords: ['projelerimi göster', 'proje listesi', 'projeleri listele'] },
  { action: 'select_project', keywords: ['proje seç', 'projeye geç'] },

  { action: 'create_nextjs', keywords: ['next.js', 'nextjs'] },
  { action: 'create_vue', keywords: ['vue'] },
  { action: 'create_react', keywords: ['react'] },
  { action: 'create_flask', keywords: ['flask'] },
  { action: 'create_fastapi', keywords: ['fastapi'] },
  { action: 'create_express', keywords: ['express'] },

  { action: 'run', keywords: ['çalıştır', 'başlat', 'run', 'start'] },

  { action: 'phone_battery', keywords: [
    'pil durumu',
    'batarya durumu',
    'şarj durumu'
  ] },
  { action: 'phone_clipboard_get', keywords: [
    'pano içeriği',
    'panoyu göster',
    'kopyalanan yazı'
  ] },

  { action: 'auto_build', keywords: [
    'otomatik oluştur',
    'tam otomatik',
    'baştan sona oluştur',
    'hepsini otomatik yap'
  ] },

  { action: 'planner', keywords: [
    'plan oluştur',
    'görev oluştur',
    'planla'
  ] },
{ action: 'apply_plan', keywords: [
  'uygula',
  'planı uygula',
  'başla',
  'devam et'
] },
  { action: 'add_jwt', keywords: ['jwt'] },
  { action: 'add_login', keywords: ['login', 'giriş sistemi', 'kullanıcı girişi'] },
  { action: 'add_sqlite', keywords: ['sqlite'] },
  { action: 'add_postgres', keywords: ['postgresql', 'postgres'] },
  { action: 'add_mongo', keywords: ['mongodb', 'mongo'] },
  { action: 'add_tailwind', keywords: ['tailwind'] },
  { action: 'add_helmet', keywords: ['helmet'] },
  { action: 'add_cors', keywords: ['cors', 'cors ekle'] },
  { action: 'add_ratelimit', keywords: ['rate limit', 'ratelimit'] },
  { action: 'add_oauth', keywords: ['oauth'] },
  { action: 'add_docker_compose', keywords: ['docker compose', 'docker-compose'] },
  { action: 'add_docker', keywords: ['docker'] },
  { action: 'add_github_actions', keywords: ['github actions', 'ci/cd', 'cicd'] },
  { action: 'add_swagger', keywords: ['swagger', 'openapi'] },
  { action: 'add_test', keywords: ['test oluştur', 'testleri oluştur', 'test ekle', 'test yaz'] },

  { action: 'generate_readme', keywords: ['readme oluştur', 'readme yaz'] },

  {
    action: 'analyze',
    keywords: [
      'analiz et', 'projeyi analiz', 'analyze',
      'projeyi açıkla', 'bu projeyi açıkla', 'projeyi anlat', 'ne yapıyor'
    ]
  },

  {
    action: 'fix',
    keywords: [
      'hata düzelt', 'hataları düzelt', 'fix',
      'güvenlik açı', 'güvenliği artır', 'güvenlik kontrol'
    ]
  },
  { action: 'voice_command', keywords: [
    'sesli komut',
    'sesle komut ver',
    'dinle'
  ] },
  { action: 'speak_text', keywords: [
    'sesli soyle',
    'sesli söyle',
    'seslendir'
  ] },
  { action: 'plugin_list', keywords: [
    'pluginleri listele',
    'plugin listesi'
  ] },
  { action: 'plugin_enable', keywords: [
    'plugin ac',
    'plugin aç'
  ] },
  { action: 'plugin_disable', keywords: [
    'plugin kapat'
  ] },
  { action: 'plugin_run', keywords: [
    'plugin calistir',
    'plugin çalıştır'
  ] },
  { action: 'workflow_create', keywords: [
    'workflow olustur',
    'workflow oluştur'
  ] },
  { action: 'workflow_list', keywords: [
    'workflowlari listele',
    'workflowları listele',
    'workflow listesi'
  ] },
  { action: 'workflow_run', keywords: [
    'workflow calistir',
    'workflow çalıştır'
  ] },
  { action: 'file_task', keywords: [
    'dosyalari listele',
    'dosyaları listele',
    'dosya olustur',
    'dosya oluştur',
    'dosya sil',
    'dosya tasi',
    'dosya taşı',
    'klasor olustur',
    'klasör oluştur',
    'dosyada ara',
    'kodda ara',
    'dosyayi oku',
    'dosyayı oku'
  ] },
  { action: 'web_search', keywords: [
    'internette ara',
    'internette arastir',
    'internette araştır',
    'webde ara',
    "web'de arastir",
    "web'de araştır",
    'youtube da ara',
    'youtube de ara',
    'youtube ta ara',
    'youtube te ara',
    'reddit da ara',
    'reddit de ara',
    'reddit ta ara',
    'reddit te ara',
    'github da ara',
    'github de ara',
    'github ta ara',
    'github te ara',
    'wikipedia da ara',
    'wikipedia de ara',
    'wikipedia ta ara',
    'wikipedia te ara',
    'stackoverflow da ara',
    'stackoverflow de ara',
    'stackoverflow ta ara',
    'stackoverflow te ara',
    'npm da ara',
    'npm de ara',
    'npm ta ara',
    'npm te ara',
    'news da ara',
    'news de ara',
    'news ta ara',
    'news te ara',
    'weather da ara',
    'weather de ara',
    'weather ta ara',
    'weather te ara',
    'currency da ara',
    'currency de ara',
    'currency ta ara',
    'currency te ara',
    'haber da ara',
    'haber de ara',
    'haber ta ara',
    'haber te ara',
    'hava durumu da ara',
    'hava durumu de ara',
    'hava durumu ta ara',
    'hava durumu te ara',
    'doviz da ara',
    'doviz de ara',
    'doviz ta ara',
    'doviz te ara',
    'döviz da ara',
    'döviz de ara',
    'döviz ta ara',
    'döviz te ara'
  ] },

  { action: 'terminal_run', keywords: [
    'terminalde calistir',
    'terminalde çalıştır',
    'komut calistir',
    'komut çalıştır',
    'shell calistir',
    'shell çalıştır'
  ] },
  { action: 'show_memory', keywords: [
    'gecmisi goster',
    'geçmişi göster',
    'ne yaptik',
    'ne yaptık'
  ] },
  { action: 'patch_project', keywords: [
    'kodu duzelt',
    'router u duzelt',
    'jwt yi guncelle',
    'patch at',
    'kodu guncelle',
    'sistemi guncelle'
  ] },
  { action: 'generate_feature', keywords: [
    'ozellik ekle',
    'özellik ekle',
    'sistem ekle',
    'yeni sistem olustur',
    'yeni sistem oluştur'
  ] },

  {
    action: 'edit',
    keywords: [
      'düzenle', 'değiştir', 'güncelle',
      'optimize et', 'optimize', 'refactor',
      'performansı artır', 'performans iyileştir',
      'gereksiz dosyaları temizle', 'temizle'
    ]
  }
];

function normalize(text) {

  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .trim();

}

function match(input) {

  const text = normalize(input);

  // Önce çok kelimeli komutları kontrol et
  for (const rule of rules) {
    for (const kw of rule.keywords) {

      const keyword = normalize(kw);

      if (keyword.includes(' ') && text.includes(keyword)) {
        return rule.action;
      }

    }
  }

  // Sonra tek kelimeli komutları kontrol et
  for (const rule of rules) {
    for (const kw of rule.keywords) {

      const keyword = normalize(kw);

      if (!keyword.includes(' ') && text.includes(keyword)) {
        return rule.action;
      }

    }
  }

  return null;

}

module.exports = { match, rules };

