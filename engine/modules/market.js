"use strict";

const marketApi = require("../../api/marketApi");

class Market{

    async run(engine, prompt, context){
        const detected = marketApi.detect(prompt);
        if (detected && detected.type === "crypto") {
            const price = await marketApi.getCryptoPrice(detected.coin);
            if (price) return price;
        }
        return await engine.ai.ask(
            "Bir finans uzmanı gibi cevap ver:\n\n" + prompt,
            context
        );
    }

}

module.exports=new Market();
