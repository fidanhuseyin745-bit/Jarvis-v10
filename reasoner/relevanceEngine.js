"use strict";

class RelevanceEngine{

    constructor(){

        this.stopWords=[
            "ve","ile","için","bir","bu","şu","da","de","mi","mı",
            "mu","mü","ne","nedir","nasıl","bugün","son","güncel"
        ];

    }

    tokenize(text){

        return String(text||"")
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu," ")
            .split(/\s+/)
            .filter(w=>w.length>2)
            .filter(w=>!this.stopWords.includes(w));

    }

    score(question,result){

        const text=((result.title||"")+" "+(result.snippet||"")).toLowerCase();

        const words=this.tokenize(question);

        let score=0;

        for(const word of words){

            if(text.includes(word))
                score+=25;

        }

        if(result.title){

            const title=result.title.toLowerCase();

            for(const word of words){

                if(title.includes(word))
                    score+=15;

            }

        }

        const badWords=[
            "galeri",
            "video",
            "fotoğraf",
            "magazin",
            "fal",
            "burç",
            "reklam",
            "tıklayın",
            "uyuşturucu",
            "cinayet"
        ];

        for(const bad of badWords){

            if(text.includes(bad))
                score-=60;

        }

        return score;

    }

    filter(question,results){

        return results
            .map(r=>({

                ...r,

                relevance:this.score(question,r)

            }))
            .filter(r=>r.relevance>=25)
            .sort((a,b)=>b.relevance-a.relevance);

    }

}

module.exports=new RelevanceEngine();
