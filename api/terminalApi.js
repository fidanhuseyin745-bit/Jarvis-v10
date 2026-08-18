"use strict";

const { execSync, exec } = require("child_process");

const DANGEROUS_PATTERNS = [
    /rm\s+-rf\s+\//,
    /rm\s+-rf\s+~/,
    /rm\s+-rf\s+\*/,
    /:\(\)\{.*\};:/,
    /mkfs\./,
    /dd\s+if=/,
    />\s*\/dev\/sd/,
    /chmod\s+-R\s+777\s+\//,
    /chown\s+-R.*\//,
    /\breboot\b/,
    /\bshutdown\b/,
    /\bkillall\b/,
    /:\s*>\s*\/etc/,
    /curl\s+.*\|\s*(bash|sh)/,
    /wget\s+.*\|\s*(bash|sh)/
];

const ALLOWED_KEYWORDS = [
    "ls", "pwd", "cd", "cat", "echo", "grep", "find", "wc", "head", "tail",
    "date", "whoami", "uname", "df", "du", "free", "uptime", "ps", "top",
    "node", "npm", "npx", "git", "python", "python3", "pip", "pip3",
    "mkdir", "cp", "mv", "touch", "tree", "which", "env", "printenv",
    "history", "man", "less", "more", "sort", "uniq", "cut", "tr",
    "diff", "file", "stat", "basename", "dirname", "realpath",
    "git", "gh", "curl", "wget"
];

class TerminalApi {

    isDangerous(cmd) {
        return DANGEROUS_PATTERNS.some(p => p.test(cmd));
    }

    isAllowed(cmd) {
        const first = cmd.trim().split(/\s+/)[0];
        const base = first.split("/").pop();
        if (ALLOWED_KEYWORDS.includes(base)) return true;
        if (base === "sudo") return false;
        return ALLOWED_KEYWORDS.some(k => base === k);
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();
        if (lower.includes("terminal") || lower.includes("komut çalıştır") ||
            lower.includes("komut calistir") || lower.includes("kabuk") ||
            lower.includes("shell") || lower.includes("çalıştır:") ||
            lower.includes("calistir:")) {

            const m = text.match(/(?:terminal|komut çalıştır|komut calistir|kabuk|shell|çalıştır:|calistir:)\s*[:\s]*\s*(.+)/i);
            if (m) return { type: "run", cmd: m[1].trim() };
            return { type: "interactive" };
        }
        return null;
    }

    async execute(text) {
        const detected = this.detect(text);
        if (!detected) return null;

        if (detected.type === "interactive") {
            return "Terminal komutu ver. Örnek: 'terminal: ls -la' veya 'komut çalıştır: git status'";
        }

        return await this._run(detected.cmd);
    }

    async _run(cmd) {
        if (this.isDangerous(cmd)) {
            return "🚫 Güvenlik: Bu komut engellendi (tehlikeli işlem):\n  " + cmd;
        }

        if (!this.isAllowed(cmd)) {
            return "🚫 Güvenlik: Bu komut izin verilenler listesinde değil:\n  " + cmd +
                "\n\nİzin verilenler: ls, cat, grep, find, git, node, npm, python, gh, curl vb.";
        }

        return new Promise(resolve => {
            exec(cmd, {
                cwd: process.cwd(),
                encoding: "utf8",
                timeout: 30000,
                maxBuffer: 1024 * 1024 * 2,
                shell: process.env.SHELL || "/bin/bash"
            }, (err, stdout, stderr) => {
                if (err) {
                    const errMsg = (stderr || err.message || "").trim();
                    if (err.killed) {
                        resolve("⏱ Zaman aşımı (30sn). Komut çok uzun sürdü:\n  " + cmd);
                        return;
                    }
                    resolve("❌ Hata (çıkış " + (err.code || "?") + "):\n" + (errMsg || "(çıktı yok)"));
                    return;
                }
                const out = (stdout || "").trim();
                const err2 = (stderr || "").trim();
                let result = "";
                if (out) result += out;
                if (err2) result += (out ? "\n" : "") + "⚠ stderr:\n" + err2;
                if (!result) result = "(çıktı yok)";
                resolve("✅ " + cmd + "\n\n" + result);
            });
        });
    }

}

module.exports = new TerminalApi();
