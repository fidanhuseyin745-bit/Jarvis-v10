"use strict";

const cryptoSkill = require("./cryptoSkill");
const currencySkill = require("./currencySkill");

/**
 * MarketSkill — finansal istekleri crypto/currency
 * skill'lerine yönlendirir (AI'a bağımlılık yok).
 */
module.exports = {
    name: "Market",

    match(text) {
        return cryptoSkill.match(text) || currencySkill.match(text);
    },

    async run(input) {
        if (cryptoSkill.match(input)) return await cryptoSkill.run(input);
        if (currencySkill.match(input)) return await currencySkill.run(input);
        return "Finans bilgi bulunamadı.";
    }
};
