"use strict";

class Intelligence{

    async analyze(prompt){

        prompt=String(prompt||"").toLowerCase().trim();

        const has=(...words)=>words.some(w=>prompt.includes(w));

        const state={

            type:"chat",

            news:false,
            market:false,
            study:false,
            phone:false,
            coding:false,
            compare:false,
            explain:false,
            search:false,
            memory:true

        };

        if(
            has(
                "haber",
                "bugün",
                "güncel",
                "son gelişme",
                "araştır",
                "internette"
            )
        ){

            state.news=true;
            state.search=true;
            state.type="news";

        }

        if(
            has(
                "bitcoin",
                "kripto",
                "dolar",
                "euro",
                "altın",
                "borsa",
                "hisse"
            )
        ){

            state.market=true;
            state.search=true;
            state.type="market";

        }

        if(
            has(
                "yks",
                "tyt",
                "ayt",
                "matematik",
                "fizik",
                "kimya",
                "biyoloji",
                "ders"
            )
        ){

            state.study=true;
            state.type="study";

        }

        if(
            has(
                "telefon",
                "android",
                "youtube",
                "uygulama",
                "chrome"
            )
        ){

            state.phone=true;
            state.type="phone";

        }

        if(
            has(
                "kod",
                "node",
                "javascript",
                "python",
                "debug",
                "github"
            )
        ){

            state.coding=true;
            state.type="coding";

        }

        if(
            has(
                "nedir",
                "nasıl",
                "niye",
                "neden",
                "açıkla",
                "anlat"
            )
        ){

            state.explain=true;

        }

        if(
            has(
                "mi",
                "mı",
                "vs",
                "karşılaştır",
                "hangisi"
            )
        ){

            state.compare=true;

        }

        return state;

    }

}

module.exports=new Intelligence();
