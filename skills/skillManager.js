"use strict";

const fs=require("fs");
const path=require("path");

class SkillManager{

    constructor(){

        this.skills=[];

    }

    load(){

        const dir=__dirname;

        const files=fs.readdirSync(dir);

        this.skills=[];

        for(const file of files){

            if(file==="skillManager.js")
                continue;

            if(!file.endsWith(".js"))
                continue;

            try{

                const skill=require(path.join(dir,file));

                this.skills.push(skill);

                console.log("✅ Skill:",skill.name);

            }catch(e){

                console.log("❌",file,e.message);

            }

        }

    }

    async find(input){

        input=input.toLowerCase();

        for(const skill of this.skills){

            if(skill.match(input))
                return skill;

        }

        return null;

    }

}

module.exports=new SkillManager();
