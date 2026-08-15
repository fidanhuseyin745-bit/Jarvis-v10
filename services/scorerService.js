"use strict";

class ScorerService{

    constructor(){

        this.keywords=[
            "yapay zeka",
            "kuantum",
            "quantum",
            "bitcoin",
            "spacex",
            "türkiye",
            "araştırma",
            "bilim",
            "teknoloji",
            "geliştirdi",
            "duyurdu",
            "açıkladı",
            "yayınladı",
            "üniversite",
            "şirket",
            "google",
            "openai",
            "microsoft",
            "nasa"
        ];

    }

    score(text){

        text=String(text||"").toLowerCase();

        let score=0;

        if(text.length>80)
            score+=10;

        if(text.length>120)
            score+=10;

        if(text.length>180)
            score+=10;

        for(const word of this.keywords){

            if(text.includes(word))
                score+=8;

        }

        if(/\d{4}/.test(text))
            score+=5;

        if(text.includes("%"))
            score+=3;

        if(
            text.includes("bugün")||
            text.includes("güncel")
        )
            score+=5;

        return score;

    }

    rank(list){

        return list
            .map(text=>({

                text,

                score:this.score(text)

            }))
            .sort((a,b)=>b.score-a.score);

    }

}

module.exports=new ScorerService();
