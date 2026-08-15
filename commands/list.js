'use strict';

const fs=require('fs');

class List{

constructor(projects){

this.projects=projects;

}

show(){

const root=this.projects.root;

const list=fs.readdirSync(root);

console.log();

console.log('📂 Projeler');

console.log('--------------');

list.forEach(x=>console.log(x));

console.log();

}

}

module.exports=List;
