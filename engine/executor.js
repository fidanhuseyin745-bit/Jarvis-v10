"use strict";

const modules=require("./modules");

class Executor{

    async run(engine,prompt,brain,context){

        let result=null;

        for(const [step] of brain.plan){

            switch(step){

                case "memory":
                    break;

                case "market":
                    result=await modules.market.run(engine,prompt,context);
                    break;

                case "web":
                    result=await modules.news.run(engine,prompt,context);
                    break;

                case "study":
                    result=await modules.study.run(engine,prompt,context);
                    break;

                case "phone":
                    result=await modules.phone.run(engine,prompt,context);
                    break;

                case "coding":
                    result=await modules.chat.run(engine,prompt,context);
                    break;

                case "research":
                    result=await modules.research.run(engine,prompt,context);
                    break;

                case "compare":
                case "explain":
                    break;
            }

            if(result)
                return result;

        }

        return await modules.chat.run(engine,prompt,context);

    }

}

module.exports=new Executor();
