'use strict';

const PatchManager=require('../core/patchManager');

class Patch{

constructor(projects){

this.projects=projects;
this.pm=new PatchManager('.');

}

run(input){

const cmd=input.toLowerCase();

if(cmd.includes('cors')){
return this.pm.addCors();
}

console.log('❌ Desteklenmeyen patch.');

}

}

module.exports=Patch;
