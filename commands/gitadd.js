'use strict';

const {execSync}=require('child_process');

module.exports=function(dir){

execSync('git add .',{
cwd:dir,
stdio:'inherit'
});

console.log('✅ Dosyalar eklendi');

}
