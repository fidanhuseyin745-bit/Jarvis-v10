"use strict";

const fs=require("fs");

class MemoryManager{

    constructor(){

        this.file="./memory/shortMemory.json";

    }

    load(){

        try{

            return JSON.parse(fs.readFileSync(this.file));

        }catch{

            return [];

        }

    }

    save(data){

        fs.writeFileSync(
            this.file,
            JSON.stringify(data,null,2)
        );

    }

}

module.exports=new MemoryManager();
