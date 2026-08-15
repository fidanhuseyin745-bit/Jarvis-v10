"use strict";

const fs = require("fs");
const path = require("path");

class Memory{

    constructor(){

        this.file = path.join(__dirname,"memory.json");

    }

    loadAll(){

        try{

            return JSON.parse(
                fs.readFileSync(this.file,"utf8")
            );

        }catch{

            return [];

        }

    }

    async load(){

        return this.loadAll();

    }

    async save(prompt,reply){

        const data=this.loadAll();

        data.push({

            prompt,
            reply,
            time:Date.now()

        });

        while(data.length>20)
            data.shift();

        fs.writeFileSync(
            this.file,
            JSON.stringify(data,null,2)
        );

    }

}

module.exports=Memory;
