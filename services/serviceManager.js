"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

class ServiceManager {

    isRunning(port) {
        try {
            require("child_process").execSync("curl -s -o /dev/null http://127.0.0.1:" + port, { stdio: "ignore" });
            return true;
        } catch {
            return false;
        }
    }

    start(name, dir, file, port) {
        if (this.isRunning(port)) {
            console.log("✅ " + name + " zaten çalışıyor.");
            return;
        }

        const entry = path.join(dir, file);
        if (!fs.existsSync(entry)) {
            console.log("ℹ️ " + name + " bulunamadı (" + entry + "), atlanıyor.");
            return;
        }

        console.log("🚀 " + name + " başlatılıyor (port " + port + ")...");

        const child = spawn("node", [entry], {
            cwd: dir,
            detached: true,
            stdio: "ignore",
            env: Object.assign({}, process.env, { PORT: String(port) })
        });

        child.unref();
    }

    /**
     * Jarvis'in kendi REST API sunucusunu (varsa) başlatır.
     * Üretimde opsiyonel — cli için zorunlu değil.
     */
    boot() {
        const root = path.join(__dirname, "..");
        this.start("Jarvis REST API", path.join(root, "webserver"), "index.js", process.env.JARVIS_PORT || 3000);
        console.log("✅ Servis kontrolü tamamlandı.");
    }
}

module.exports = new ServiceManager();
