"use strict";

class Cache{

    constructor(){
        this.data=new Map();
    }

    get(key){
        return this.data.get(key);
    }

    set(key,value){
        this.data.set(key,value);
    }

    clear(){
        this.data.clear();
    }

}

module.exports=new Cache();
