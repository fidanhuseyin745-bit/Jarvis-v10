'use strict';

const detect=require('../utils/projectType');

class Type{

constructor(projects){
this.projects=projects;
}

show(){

const dir=this.projects.getCurrent();

if(!dir)
throw new Error('Aktif proje yok.');

console.log('📦',detect(dir));

}

}

module.exports=Type;
