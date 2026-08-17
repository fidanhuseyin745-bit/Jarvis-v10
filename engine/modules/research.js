"use strict";

const wikiApi = require("../../api/wikiApi");

class Research{

    async run(engine, prompt, context){
        const query = String(prompt || "").replace(/(?:konuyu derinlemesine araştır[:\s]*|araştır[:\s]*)/i, "").trim();
        if (query) {
            const wiki = await wikiApi.search(query);
            if (wiki) return wiki;
        }
        return await engine.ai.ask(
            "Konuyu derinlemesine araştır:\n\n" + prompt,
            context
        );
    }

}

module.exports=new Research();
