"use strict";

const readline = require("readline");
const jarvis = require("./core/jarvis");
const serviceManager = require("./services/serviceManager");

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "Jarvis > "
    });

    rl.on("line", async (line) => {
        line = line.trim();

        if (line === "exit") {
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

    serviceManager.boot().finally(() => {
        console.log("🤖 Jarvis v10 Başlatıldı");
        rl.prompt();
    });
}

main();
