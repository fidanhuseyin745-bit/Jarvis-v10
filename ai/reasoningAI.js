"use strict";

const LocalEngine = require("./localEngine");

class ReasoningAI {

    constructor() {
        this.engine = new LocalEngine();
    }

    async generate(question, report, context) {
        if (!report || !report.best || report.best.length === 0)
            return null;

        let facts = "";

        report.best.forEach((x, i) => {
            facts += (i + 1) + ". " + x.text + "\n";
        });

        const prompt = "Aşağıdaki bilgileri kullanarak '" + question + "' sorusuna kısa ve doğal bir cevap yaz:\n\n" + facts;

        return await this.engine.ask(prompt, context);
    }

}

module.exports = new ReasoningAI();
