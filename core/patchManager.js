'use strict';

const PatchEngine=require('../patch/engine');

class PatchManager{

constructor(root){

this.patch=new PatchEngine(root);

}

addCors(){

return this.patch.appendAfter(
'registry.js',
"{ action: 'add_helmet'",
"  { action: 'add_cors', keywords: ['cors','cors ekle'] },"
);

}

}

module.exports=PatchManager;
