"use strict";

const fs = require("fs");
const path = require("path");

/**
 * ReminderSkill — yerel dosya tabanlı hatırlatıcı.
 * "hatırlat: 18:00 ekmek al" gibi istekleri kaydeder,
 * "hatırlatıcıları göster" ile listeler.
 */
module.exports = {
    name: "Reminder",

    match(text) {
        return /hatırlat|hatirlat|reminder|anımsat|animsat/i.test(text);
    },

    _file() {
        const dir = path.join(process.cwd(), "memory");
        fs.mkdirSync(dir, { recursive: true });
        return path.join(dir, "reminders.json");
    },

    _load() {
        try {
            return JSON.parse(fs.readFileSync(this._file(), "utf8"));
        } catch (e) {
            return [];
        }
    },

    _save(list) {
        fs.writeFileSync(this._file(), JSON.stringify(list, null, 2));
    },

    async run(input) {
        if (/göster|listele|goster|var mı/i.test(input)) {
            const list = this._load();
            if (list.length === 0) return "Hiç hatırlatıcı yok.";
            const lines = ["📌 Hatırlatıcılar:"];
            list.forEach((r, i) => {
                lines.push((i + 1) + ". [" + (r.time || "-") + "] " + r.text);
            });
            return lines.join("\n");
        }

        const m = input.match(/hatırlat[:\s]*([0-9:]{4,5})?\s*(.+)/i) ||
            input.match(/hatirlat[:\s]*([0-9:]{4,5})?\s*(.+)/i);
        const time = (m && m[1]) || "";
        const text = (m && m[2]) || input.replace(/hatırlat[:\s]*|hatirlat[:\s]*/i, "").trim();

        const list = this._load();
        list.push({ time, text, createdAt: new Date().toISOString() });
        this._save(list);

        if (time) {
            return "✅ Hatırlatıcı eklendi: [" + time + "] " + text;
        }
        return "✅ Hatırlatıcı eklendi: " + text + "\n(Saat belirtmediğin için anlık not olarak kaydedildi.)";
    }
};
