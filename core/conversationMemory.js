"use strict";

class ConversationMemory{

constructor(){
this.history=[];
this.max=20;
}

add(role,content){

this.history.push({role,content});

if(this.history.length>this.max){
this.history.shift();
}

}

build(messages){

return [...this.history,...messages];

}

clear(){
this.history=[];
}

}

module.exports=new ConversationMemory();
