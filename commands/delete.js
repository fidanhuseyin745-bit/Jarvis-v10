'use strict';

const fs=require('fs');

class Delete{

constructor(projects){

this.projects=projects;

}

remove(name){

const dir=this.projects.root+'/'+name;

if(!fs.existsSync(dir))
return;

fs.rmSync(dir,{
recursive:true,
force:true
});

console.log('🗑️ Silindi');

}

}

module.exports=Delete;
