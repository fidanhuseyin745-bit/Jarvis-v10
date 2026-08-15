'use strict';

const fs=require('fs');
const path=require('path');

function walk(dir,prefix=''){

for(const item of fs.readdirSync(dir)){

const full=path.join(dir,item);

console.log(prefix+item);

if(fs.statSync(full).isDirectory()){

walk(full,prefix+'  ');

}

}

}

module.exports=walk;
