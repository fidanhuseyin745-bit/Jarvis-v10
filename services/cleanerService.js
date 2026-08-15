"use strict";

class CleanerService{

    constructor(){

        this.blacklist=[
            "tıklayın",
            "video",
            "galeri",
            "fotoğraf",
            "son dakika",
            "devamını oku",
            "ayrıntılar",
            "reklam",
            "sponsorlu",
            "üye olun",
            "abonelik",
            "cookie",
            "çerez"
        ];

    }

    clean(text){

        text=String(text||"")
        .replace(/\s+/g," ")
        .replace(/\[[^\]]*\]/g,"")
        .trim();

        for(const bad of this.blacklist){

            text=text.replace(
                new RegExp(bad,"ig"),
                ""
            );

        }

        text=text
        .replace(/\s+/g," ")
        .trim();

        return text;

    }

    valid(text){

        if(!text)
            return false;

        if(text.length<50)
            return false;

        if(text.split(" ").length<8)
            return false;

        return true;

    }

}

module.exports=new CleanerService();
