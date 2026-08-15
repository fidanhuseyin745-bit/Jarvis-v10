'use strict';

const { execSync } = require('child_process');

module.exports = function(){

  try{

    console.log("🔄 Güncellemeler kontrol ediliyor...");

    console.log(execSync("git fetch",{encoding:"utf8"}));

    try{
      console.log(execSync("git pull",{encoding:"utf8"}));
    }catch(e){
      if(e.message.includes("Already up to date")){
        console.log("✅ Zaten en güncel sürümdesin.");
      }else{
        throw e;
      }
    }

    console.log("📦 Paketler güncelleniyor...");
    console.log(execSync("npm install",{encoding:"utf8"}));

    console.log("🧪 Sözdizimi kontrol ediliyor...");
    console.log(execSync("node -c index.js",{encoding:"utf8"}));

    console.log("✅ Güncelleme tamamlandı.");

  }catch(e){

    console.log("❌ Güncelleme başarısız.");
    console.log(e.message);

  }

};
