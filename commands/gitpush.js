'use strict';

const {execSync}=require('child_process');

module.exports=function(dir){

execSync('git push',{
cwd:dir,
stdio:'inherit'
});

console.log('🚀 GitHub push tamam');

}
