"use strict";

class KnowledgeGraph{

    constructor(){

        this.nodes=new Map();

    }

    add(report){

        if(!report.best)
            return;

        for(const fact of report.best){

            if(!fact.subject)
                continue;

            if(!this.nodes.has(fact.subject)){

                this.nodes.set(fact.subject,{

                    subject:fact.subject,

                    mentions:0,

                    confidence:0,

                    entities:[],

                    history:[]

                });

            }

            const node=this.nodes.get(fact.subject);

            node.mentions++;

            node.confidence=Math.max(
                node.confidence,
                fact.confidence
            );

            for(const e of fact.entities){

                if(
                    !node.entities.find(x=>x.name===e.name)
                ){

                    node.entities.push(e);

                }

            }

            node.history.push({

                text:fact.text,

                date:new Date().toISOString()

            });

        }

    }

    get(subject){

        return this.nodes.get(subject)||null;

    }

    all(){

        return [...this.nodes.values()];

    }

}

module.exports=new KnowledgeGraph();
