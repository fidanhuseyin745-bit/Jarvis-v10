"use strict";

const engine = require("../engine");
const skillManager = require("../skills/skillManager");

/**
 * Jarvis: ana giriş noktası.
 * Önce skill kütüphanesinde eşleşme arar (hızlı, AI'a
 * bağımlı olmayan yetenekler). Eşleşme yoksa karar
 * motorunu (engine) kullanır; o da en sonunda AI'a düşer.
 */
class Jarvis {

    async execute(input) {

        input = String(input || "").trim();

        if (!input) {
            console.log("\n❓ Bir şey yazmadın.\n");
            return;
        }

        try {

            const skill = await skillManager.find(input);

            if (skill) {
                console.log("\n🧩 " + skill.name + " skill'i çalışıyor...\n");
                const reply = await skill.run(input);
                if (reply) console.log(reply + "\n");
                return;
            }

            const answer = await engine.reply(input);
            if (answer) console.log("\n🤖 " + answer + "\n");

        } catch (e) {
            console.log("\n❌ " + e.message + "\n");
        }
    }
}

module.exports = new Jarvis();
