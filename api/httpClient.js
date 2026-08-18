"use strict";

const https = require("https");
const http = require("http");
const { URL } = require("url");

function get(url, { headers = {}, timeout = 8000 } = {}) {
    return new Promise((resolve, reject) => {
        let target;
        try {
            target = new URL(url);
        } catch (e) {
            reject(new Error("Geçersiz URL: " + url));
            return;
        }

        const lib = target.protocol === "https:" ? https : http;
        const opts = {
            hostname: target.hostname,
            port: target.port || (target.protocol === "https:" ? 443 : 80),
            path: target.pathname + target.search,
            method: "GET",
            headers: Object.assign({
                "User-Agent": "Jarvis/10 (local assistant)",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.5"
            }, headers)
        };

        const req = lib.request(opts, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const next = new URL(res.headers.location, target).toString();
                res.resume();
                get(next, { headers, timeout }).then(resolve, reject);
                return;
            }

            let body = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => { body += chunk; });
            res.on("end", () => {
                if (res.statusCode >= 400) {
                    reject(new Error("HTTP " + res.statusCode));
                    return;
                }
                resolve({ status: res.statusCode, headers: res.headers, body });
            });
        });

        req.on("error", reject);
        req.setTimeout(timeout, () => {
            req.destroy(new Error("Zaman aşımı (" + timeout + "ms)"));
        });

        req.end();
    });
}

async function getJson(url, opts = {}) {
    const res = await get(url, opts);
    try {
        return JSON.parse(res.body);
    } catch {
        throw new Error("JSON çözülemedi");
    }
}

function post(url, data, { headers = {}, timeout = 8000 } = {}) {
    return new Promise((resolve, reject) => {
        let target;
        try {
            target = new URL(url);
        } catch (e) {
            reject(new Error("Geçersiz URL: " + url));
            return;
        }

        const lib = target.protocol === "https:" ? https : http;
        const body = typeof data === "string" ? data : JSON.stringify(data);
        const isForm = typeof data === "string" && data.includes("=") && !data.startsWith("{");

        const opts = {
            hostname: target.hostname,
            port: target.port || (target.protocol === "https:" ? 443 : 80),
            path: target.pathname + target.search,
            method: "POST",
            headers: Object.assign({
                "User-Agent": "Jarvis/10 (local assistant)",
                "Content-Type": isForm ? "application/x-www-form-urlencoded" : "application/json",
                "Content-Length": Buffer.byteLength(body)
            }, headers)
        };

        const req = lib.request(opts, (res) => {
            let respBody = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => { respBody += chunk; });
            res.on("end", () => {
                resolve({ status: res.statusCode, headers: res.headers, body: respBody });
            });
        });

        req.on("error", reject);
        req.setTimeout(timeout, () => {
            req.destroy(new Error("Zaman aşımı"));
        });

        req.write(body);
        req.end();
    });
}

module.exports = { get, getJson, post };
