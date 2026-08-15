"use strict";

class Reasoner{

    clean(text){

        text=String(text||"");

        const blacklist=[
            "tıklayın",
            "video",
            "fotoğraf",
            "galeri",
            "son dakika haberleri",
            "devamını oku",
            "ayrıntılar",
            "buraya tıklayın"
        ];

        text=text.replace(/\s+/g," ").trim();

        for(const bad of blacklist){

            text=text.replace(new RegExp(bad,"ig"),"");

        }

        return text.trim();

    }

    score(text){

        let score=0;

        if(text.length>80) score+=5;
        if(text.length>120) score+=5;

        if(
            text.includes("geliştirdi")||
            text.includes("duyurdu")||
            text.includes("açıkladı")
        ) score+=10;

        if(
            text.includes("Türkiye")||
            text.includes("Yapay Zeka")||
            text.includes("Quantum")||
            text.includes("Bitcoin")
        ) score+=5;

        return score;

    }

    process(results){

        const list=[];

        for(const r of results){

            if(!r.snippet) continue;

            const text=this.clean(r.snippet);

            if(text.length<50) continue;

            list.push({

                text,

                score:this.score(text)

            });

        }

        list.sort((a,b)=>b.score-a.score);

        const final=[];

        for(const item of list){

            if(final.some(f=>f.text===item.text))
                continue;

            final.push(item);

            if(final.length===3)
                break;

        }

        return final.map(x=>x.text);

    }

}

module.exports=new Reasoner();
