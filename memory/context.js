'use strict';

class Context{

constructor(){

this.history=[];

}

add(item){

this.history.push(item);

}

all(){

return this.history;

}

clear(){

this.history=[];

}

}

module.exports=new Context();
