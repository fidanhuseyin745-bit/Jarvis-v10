"use strict";

const extractor=require("./factExtractor");
const detector=require("./entityDetector");
const confidence=require("./confidenceEngine");
const cleaner=require("./cleaner");

class Reasoner{

    analyze(results){

        const facts=extractor.extract(results);

        const knowledge=[];

        for(const fact of facts){

            const entities=detector.detect(fact.text);

            const score=confidence.score(
                fact,
                entities
            );

            const text=cleaner.clean(fact.text);

            knowledge.push({

                subject:fact.subject||"Bilinmiyor",

                text,

                numbers:fact.numbers||[],

                dates:fact.dates||[],

                entities,

                confidence:score,

                importance:
                    score+
                    entities.length*5+
                    fact.numbers.length*2

            });

        }

        knowledge.sort(
            (a,b)=>b.importance-a.importance
        );

        const average=
            knowledge.length
            ?Math.round(
                knowledge.reduce(
                    (sum,item)=>sum+item.confidence,
                    0
                )/knowledge.length
            )
            :0;

        return{

            total:knowledge.length,

            best:knowledge.slice(0,3),

            all:knowledge,

            average,

            strongest:
                knowledge.length
                ?knowledge[0]
                :null

        };

    }

}

module.exports=new Reasoner();
