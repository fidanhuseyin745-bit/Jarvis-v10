"use strict";

class EntityDetector{

    constructor(){

        this.dictionary={

            bitcoin:"crypto",
            ethereum:"crypto",
            solana:"crypto",
            bnb:"crypto",

            openai:"company",
            google:"company",
            microsoft:"company",
            meta:"company",
            apple:"company",
            amazon:"company",
            nvidia:"company",

            spacex:"space",
            nasa:"space",
            esa:"space",
            tua:"space",
            "tübitak":"science",

            "türkiye":"country",
            amerika:"country",
            rusya:"country",
            japonya:"country",
            çin:"country",

            python:"language",
            javascript:"language",
            java:"language",
            "c++":"language",
            node:"runtime"

        };

    }

    detect(text){

        text=String(text||"").toLowerCase();

        const words=text.match(/[a-z0-9çğıöşü+#.]+/gi)||[];

        const entities=[];

        for(const word of words){

            const type=this.dictionary[word];

            if(type){

                entities.push({

                    name:word,
                    type

                });

            }

        }

        return entities;

    }

}

module.exports=new EntityDetector();
