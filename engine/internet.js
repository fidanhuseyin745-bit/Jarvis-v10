"use strict";

class Internet{

    async need(prompt){

        prompt=prompt.toLowerCase();

        const words=[

            "haber",
            "bugün",
            "son",
            "güncel",
            "dolar",
            "borsa",
            "bitcoin",
            "altın",
            "kripto",
            "piyasa"

        ];

        for(const word of words){

            if(prompt.includes(word))
                return true;

        }

        return false;

    }

}

module.exports=Internet;
