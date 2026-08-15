'use strict';

const Coder=require('./coder');

class Agents{

constructor(){

this.coder=new Coder();

}

getCoder(){

return this.coder;

}

}

module.exports=Agents;
