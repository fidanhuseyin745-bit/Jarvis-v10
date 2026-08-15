'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = function (dir, msg) {

  const gitDir = path.join(dir, '.git');

  if (!fs.existsSync(gitDir)) {
    console.log('🔧 Bu projede git deposu yok, başlatılıyor...');
    execSync('git init', { cwd: dir, stdio: 'inherit' });
  }

  execSync('git add -A', {
    cwd: dir,
    stdio: 'inherit'
  });

  try {

    execSync(`git commit -m "${msg}"`, {
      cwd: dir,
      stdio: 'inherit'
    });

    console.log('✅ Commit oluşturuldu.');

  } catch (e) {

    console.log('ℹ️ Commit edilecek yeni bir değişiklik yok.');

  }

};
