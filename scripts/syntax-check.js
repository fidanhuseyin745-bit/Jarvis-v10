"use strict";

/**
 * Tüm .js dosyalarının sözdizimini `node -c` ile kontrol eder.
 * Jest'ten bağımsız hızlı bir geçit testi.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "projects", "backups", "tests", "templates"]);

function walk(dir, out) {
    let entries = [];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return;
    }
    for (const e of entries) {
        if (e.isDirectory()) {
            if (SKIP.has(e.name)) continue;
            walk(path.join(dir, e.name), out);
        } else if (e.isFile() && e.name.endsWith(".js")) {
            out.push(path.join(dir, e.name));
        }
    }
}

const files = [];
walk(ROOT, files);

let failed = 0;
for (const f of files) {
    try {
        execSync("node -c " + JSON.stringify(f), { stdio: "pipe" });
    } catch (e) {
        failed++;
        const msg = (e.stderr && e.stderr.toString()) || e.message;
        console.log("❌ " + path.relative(ROOT, f));
        console.log("   " + msg.trim());
    }
}

if (failed > 0) {
    console.log("\n" + failed + " dosyada sözdizimi hatası.");
    process.exit(1);
}

console.log("✅ Tüm .js dosyaları (" + files.length + ") sözdizimi olarak temiz.");
