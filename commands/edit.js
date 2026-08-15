'use strict';

const fs=require('fs');
const path=require('path');

class Edit{

constructor(projects){
this.projects=projects;
}

run(file,content){

const dir=this.projects.getCurrent();

const target=path.join(dir,file);

fs.writeFileSync(target,content);

console.log('✅ Dosya güncellendi:',file);

}

}

module.exports=Edit;
