'use strict';

const {execSync}=require('child_process');

class Install{

run(project){

execSync('npm install',{
cwd:project,
stdio:'inherit'
});

console.log('📦 Kurulum tamam');

}

}

module.exports=Install;
