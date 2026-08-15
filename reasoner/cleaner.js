"use strict";

class Cleaner{

    clean(text){

        text=String(text||"");

        const remove=[

            /bu sayfada/gi,
            /bu yazıda/gi,
            /tıklayın/gi,
            /son dakika/gi,
            /fotoğraf/gi,
            /video/gi,
            /galeri/gi,
            /yer almaktadır/gi,
            /takip edebilirsiniz/gi,
            /devamını okuyun/gi,
            /ayrıntılar için/gi,
            /haberler burada/gi,
            /tüm haberler/gi

        ];

        for(const r of remove){

            text=text.replace(r,"");

        }

        text=text
            .replace(/\s+/g," ")
            .replace(/\.{2,}/g,".")
            .trim();

        if(text.length>220)
            text=text.substring(0,220)+"...";

        return text;

    }

}

module.exports=new Cleaner();
