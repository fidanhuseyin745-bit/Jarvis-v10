'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class Runner {

constructor(projects){
this.projects=projects;
}

run(){

const dir=this.projects.getCurrent();

if(!dir)
throw new Error('Aktif proje yok.');

console.log('📂 Proje:');
console.log(dir);

// React (Vite)
if(fs.existsSync(path.join(dir,'vite.config.js'))){

console.log('⚛ React başlatılıyor...');

execSync(
'npm run dev',
{
cwd:dir,
stdio:'inherit'
}
);

return;

}

// Express / Node
if(fs.existsSync(path.join(dir,'package.json'))){

const pkg=JSON.parse(
fs.readFileSync(
path.join(dir,'package.json'),
'utf8'
)
);

if(pkg.scripts && pkg.scripts.start){

console.log('🚀 Node proje başlatılıyor...');

execSync(
'npm start',
{
cwd:dir,
stdio:'inherit'
}
);

return;

}

}

// Flask
if(fs.existsSync(path.join(dir,'app.py'))){

console.log('🐍 Flask başlatılıyor...');

execSync(
'python app.py',
{
cwd:dir,
stdio:'inherit'
}
);

return;

}

// FastAPI
if(fs.existsSync(path.join(dir,'main.py'))){

console.log('⚡ FastAPI başlatılıyor...');

execSync(
'uvicorn main:app --host 0.0.0.0 --port 8000',
{
cwd:dir,
stdio:'inherit'
}
);

return;

}

throw new Error('Desteklenmeyen proje.');

}

}

module.exports=Runner;
