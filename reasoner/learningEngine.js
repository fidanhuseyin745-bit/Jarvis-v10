"use strict";

class LearningEngine{

    learn(graph){

        const knowledge={};

        for(const node of graph.all()){

            knowledge[node.subject]={

                mentions:node.mentions,

                confidence:node.confidence,

                related:{}

            };

            for(const entity of node.entities){

                if(entity.name===node.subject.toLowerCase())
                    continue;

                if(!knowledge[node.subject].related[entity.name]){

                    knowledge[node.subject].related[entity.name]=1;

                }else{

                    knowledge[node.subject].related[entity.name]++;

                }

            }

        }

        return knowledge;

    }

}

module.exports=new LearningEngine();
