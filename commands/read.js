'use strict';

const fs=require('fs');
const path=require('path');

class Read{

constructor(projects){
this.projects=projects;
}

run(file){

const dir=this.projects.getCurrent();

console.log(
fs.readFileSync(
path.join(dir,file),
'utf8'
)
);

}

}

module.exports=Read;
