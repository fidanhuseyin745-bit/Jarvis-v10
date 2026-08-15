"use strict";

const cleaner=require("./cleanerService");
const scorer=require("./scorerService");
const merger=require("./mergerService");
const formatter=require("./formatterService");

class GeneratorService{

    generate(question,results){

        if(!Array.isArray(results)||results.length===0)
            return "Bu konu hakkında güvenilir bilgi bulamadım.";

        let texts=[];

        for(const item of results){

            if(!item)
                continue;

            const raw=item.snippet||item.title||"";

            const text=cleaner.clean(raw);

            if(!cleaner.valid(text))
                continue;

            texts.push(text);

        }

        texts=merger.merge(texts);

        const ranked=scorer.rank(texts);

        const best=[];

        for(const item of ranked){

            if(best.length===3)
                break;

            best.push(item.text);

        }

        return formatter.format(
            question,
            best
        );

    }

}

module.exports=new GeneratorService();
