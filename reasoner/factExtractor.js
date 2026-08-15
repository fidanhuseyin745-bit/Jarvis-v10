"use strict";

class FactExtractor{

    extract(results){

        const facts=[];

        if(!Array.isArray(results))
            return facts;

        for(const item of results){

            const text=String(
                item.snippet||
                item.title||
                ""
            ).trim();

            if(!text)
                continue;

            const fact={

                text,

                subject:null,
                numbers:[],
                dates:[],
                keywords:[]

            };

            const nums=text.match(/\d+(?:[.,]\d+)?/g);
            if(nums)
                fact.numbers=nums;

            const years=text.match(/\b(19|20)\d{2}\b/g);
            if(years)
                fact.dates=years;

            const words=text.split(/\s+/);

            for(const w of words){

                if(
                    w.length>3 &&
                    /^[A-ZÇĞİÖŞÜ]/.test(w)
                ){
                    fact.keywords.push(
                        w.replace(/[.,:;!?]/g,"")
                    );
                }

            }

            if(fact.keywords.length)
                fact.subject=fact.keywords[0];

            facts.push(fact);

        }

        return facts;

    }

}

module.exports=new FactExtractor();
