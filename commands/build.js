'use strict';

const {execSync}=require('child_process');

class Build{

run(project){

execSync('npm install',{
cwd:project,
stdio:'inherit'
});

execSync('npm run build',{
cwd:project,
stdio:'inherit'
});

console.log('✅ Build tamam');

}

}

module.exports=Build;
