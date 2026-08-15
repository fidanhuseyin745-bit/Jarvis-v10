'use strict';

const {execSync}=require('child_process');

module.exports=function(dir){

execSync('git init',{
cwd:dir,
stdio:'inherit'
});

console.log('✅ Git hazır');

}
