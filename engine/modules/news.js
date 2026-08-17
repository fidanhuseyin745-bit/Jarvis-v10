"use strict";

const newsApi = require("../../api/newsApi");

class News{

    async run(engine, prompt, context){
        const news = await newsApi.getNews();
        return news || "Şu an haber kaynağına ulaşamadım. Daha sonra tekrar dene.";
    }

}

module.exports=new News();
