"use strict";

const modules=require("./modules");

class Executor{

    async run(engine,prompt,brain){

        let result=null;

        for(const [step] of brain.plan){

            switch(step){

                case "memory":
                    break;

                case "market":
                    result=await modules.market.run(engine,prompt);
                    break;

                case "web":
                    result=await modules.news.run(engine,prompt);
                    break;

                case "study":
                    result=await modules.study.run(engine,prompt);
                    break;

                case "phone":
                    result=await modules.phone.run(engine,prompt);
                    break;

                case "coding":
                    result=await modules.chat.run(engine,prompt);
                    break;

                case "research":
                    result=await modules.research.run(engine,prompt);
                    break;

                case "compare":
                case "explain":
                    break;
            }

            if(result)
                return result;

        }

        return await modules.chat.run(engine,prompt);

    }

}

module.exports=new Executor();
