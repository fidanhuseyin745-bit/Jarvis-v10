"use strict";

const readline = require("readline");
const jarvis = require("./core/jarvis");

const { VERSION } = require("./config/constants");

function banner() {
    console.log("┌─────────────────────────────────────┐");
    console.log("│   🤖 Jarvis v" + VERSION + "                │");
    console.log("│   Yapay Zeka + Skill Kütüphanesi     │");
    console.log("└─────────────────────────────────────┘");
    console.log("Komutlarınla çalışırım. Örnek:");
    console.log("  - hava durumu için istanbul");
    console.log("  - bitcoin fiyatı");
    console.log("  - dolar ne kadar");
    console.log("  - internette ara: node.js nedir");
    console.log("  - şaka yap");
    console.log("Çıkmak için: çık / exit\n");
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Jarvis > "
});

banner();
rl.prompt();

rl.on("line", async (line) => {

    line = line.trim();

    if (line === "exit" || line === "çık" || line === "quit") {
        rl.close();
        process.exit(0);
    }

    try {
        await jarvis.execute(line);
    } catch (err) {
        console.log("❌ " + err.message);
    }

    rl.prompt();

});

rl.on("close", () => {
    console.log("\n👋 Görüşürüz.");
    process.exit(0);
});
