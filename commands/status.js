'use strict';

class Status{

constructor(projects){

this.projects=projects;

}

show(){

console.log();
console.log('📂 Aktif Proje');
console.log(this.projects.getCurrent());
console.log();

}

}

module.exports=Status;
