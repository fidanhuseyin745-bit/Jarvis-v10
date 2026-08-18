"use strict";

const http = require("http");
const { URL } = require("url");

class BridgeClient {

    constructor() {
        this.url = "http://127.0.0.1:8787";
        this.timeout = 4000;
        this.available = null;
    }

    _post(path, data) {
        return new Promise((resolve, reject) => {
            let target;
            try {
                target = new URL(this.url + path);
            } catch {
                reject(new Error("Geçersiz bridge URL"));
                return;
            }

            const body = typeof data === "string" ? data : JSON.stringify(data);

            const opts = {
                hostname: target.hostname,
                port: target.port,
                path: target.pathname,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            };

            const req = http.request(opts, (res) => {
                let respBody = "";
                res.setEncoding("utf8");
                res.on("data", (c) => { respBody += c; });
                res.on("end", () => resolve({ status: res.statusCode, body: respBody }));
            });

            req.on("error", reject);
            req.setTimeout(this.timeout, () => {
                req.destroy(new Error("Bridge zaman aşımı"));
            });

            req.write(body);
            req.end();
        });
    }

    async isAvailable() {
        if (this.available !== null) return this.available;
        try {
            const res = await this._post("/ping", {});
            this.available = res.status === 200;
        } catch {
            this.available = false;
        }
        return this.available;
    }

    async send(command, args = {}) {
        try {
            const res = await this._post("/bridge", Object.assign({ command }, args));
            return res.status === 200 && (res.body === "OK" || res.body.includes("OK"));
        } catch {
            return false;
        }
    }

    async open(app) {
        return await this.send("open", { app });
    }

    async call(number) {
        return await this.send("call", { number });
    }

    async sms(number, message) {
        return await this.send("sms", { number, message });
    }

    async alarm(time, label) {
        return await this.send("alarm", { time, label });
    }

    async reminder(time, text) {
        return await this.send("reminder", { time, text });
    }

    async playMusic(query) {
        return await this.send("music", { query });
    }

    async setSetting(key, value) {
        return await this.send("setting", { key, value });
    }

}

module.exports = new BridgeClient();
