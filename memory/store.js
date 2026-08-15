'use strict';

const fs=require('fs');

class Store{

constructor(){

this.file='memory.json';

if(!fs.existsSync(this.file))
fs.writeFileSync(this.file,'{}');

}

read(){

return JSON.parse(fs.readFileSync(this.file));

}

write(data){

fs.writeFileSync(
this.file,
JSON.stringify(data,null,2)
);

}

set(k,v){

const d=this.read();

d[k]=v;

this.write(d);

}

get(k){

return this.read()[k];

}

}

module.exports=Store;
