"use strict";

const phoneApi = require("../../api/phoneApi");

class Phone{

    async run(engine, prompt){
        const result = await phoneApi.execute(prompt);
        return result || "Bu komutu anlayamadım. 'youtube aç', '0555 123 45 67 ara', 'wifi kapat' gibi deneyebilirsin.";
    }

}

module.exports=new Phone();
