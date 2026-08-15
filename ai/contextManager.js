"use strict";

class ContextManager{

    constructor(){

        this.history=[];

    }

    add(input){

        this.history.push(input);

        if(this.history.length>20){

            this.history.shift();

        }

    }

    get(){

        return this.history;

    }

}

module.exports=new ContextManager();
