"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");

class ServiceManager {

    isRunning(port) {
        return new Promise((resolve) => {
            const req = http.get(
                `http://127.0.0.1:${port}`,
                () => resolve(true)
            );
            req.setTimeout(300, () => {
                req.destroy();
                resolve(false);
            });
            req.on("error", () => resolve(false));
        });
    }

    async start(name, dir, file, port) {
        if (!fs.existsSync(dir + "/" + file)) {
            return;
        }

        if (await this.isRunning(port)) {
            console.log("✅ " + name + " zaten çalışıyor.");
            return;
        }

        console.log("🚀 " + name + " başlatılıyor...");

        const child = spawn("node", [file], {
            cwd: dir,
            detached: true,
            stdio: "ignore"
        });

        child.unref();
    }

    async boot() {
        if (process.env.AUTO_START_SERVICES === "false") {
            return;
        }

        await this.start(
            "Web API",
            (process.env.HOME || "") + "/Jarvis-v6/webserver",
            "index.js",
            3000
        );

        await this.start(
            "AI API",
            (process.env.HOME || "") + "/Jarvis-AI",
            "server.js",
            9000
        );
    }

}

module.exports = new ServiceManager();
