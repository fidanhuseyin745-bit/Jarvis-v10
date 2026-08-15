"use strict";

class ConfidenceEngine{

    score(fact,entities=[]){

        let score=50;

        if(fact.text.length>80)
            score+=10;

        if(fact.text.length>140)
            score+=10;

        if(fact.numbers.length)
            score+=5;

        if(fact.dates.length)
            score+=5;

        score+=entities.length*5;

        const trusted=[
            "nasa",
            "esa",
            "tübitak",
            "openai",
            "microsoft",
            "google"
        ];

        for(const e of entities){

            if(trusted.includes(e.name))
                score+=10;

        }

        const bad=[
            "iddia",
            "söylenti",
            "reklam",
            "tıklayın",
            "galeri"
        ];

        const text=fact.text.toLowerCase();

        for(const b of bad){

            if(text.includes(b))
                score-=20;

        }

        if(score>100)
            score=100;

        if(score<0)
            score=0;

        return score;

    }

}

module.exports=new ConfidenceEngine();
