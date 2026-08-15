"use strict";

const web=require("../../agents/webAgent");
const summarizer=require("../../ai/summarizer");
const reasoningAI=require("../../ai/reasoningAI");

const relevance=require("../../reasoner/relevanceEngine");
const reasoner=require("../../reasoner/reasoner");
const fusion=require("../../reasoner/fusionEngine");
const graph=require("../../reasoner/knowledgeGraph");
const learner=require("../../reasoner/learningEngine");

class News{

    async run(engine,prompt){

        const result=await web.search(prompt);

        if(
            !result ||
            !result.success ||
            !Array.isArray(result.results) ||
            result.results.length===0
        ){
            return "Bu konu hakkında haber bulunamadı.";
        }

        const filtered=relevance.filter(
            prompt,
            result.results
        );

        if(filtered.length===0){
            return "Bu konu hakkında yeterince alakalı bilgi bulunamadı.";
        }

        let report=reasoner.analyze(filtered);

        report=fusion.fuse(report);

        graph.add(report);

        learner.learn(graph);

        const aiAnswer=await reasoningAI.generate(
            prompt,
            report
        );

        if(aiAnswer)
            return aiAnswer;

        return summarizer.summarize(
            prompt,
            report
        );

    }

}

module.exports=new News();
