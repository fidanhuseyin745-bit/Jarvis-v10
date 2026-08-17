"use strict";

const bridge = require("../bridge/bridgeClient");

const APP_ALIASES = {
    "youtube": "youtube",
    "whatsapp": "whatsapp",
    "instagram": "instagram",
    "facebook": "facebook",
    "twitter": "twitter",
    "x": "twitter",
    "telegram": "telegram",
    "spotify": "spotify",
    "netflix": "netflix",
    "chrome": "chrome",
    "tarayıcı": "chrome",
    "tarayici": "chrome",
    "harita": "maps",
    "haritalar": "maps",
    "maps": "maps",
    "kamera": "camera",
    "galeri": "gallery",
    "ayarlar": "settings",
    "telefon": "phone",
    "rehber": "contacts",
    "mesajlar": "messages",
    "sms": "messages",
    "mail": "email",
    "e-posta": "email",
    "eposta": "email",
    "takvim": "calendar",
    "saat": "clock",
    "hesap makinesi": "calculator",
    "notlar": "notes",
    "müzik": "music",
    "muzik": "music"
};

class PhoneApi {

    constructor() {
        this.bridge = bridge;
        this.checked = false;
        this.available = false;
    }

    async _checkBridge() {
        if (this.checked) return this.available;
        this.available = await this.bridge.isAvailable();
        this.checked = true;
        if (this.available) {
            setTimeout(() => { this.checked = false; }, 60000);
        }
        return this.available;
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();

        const openMatch = text.match(/([a-zçğıöşü]+)\s+(?:aç|açar mısın|başlat|çalıştır)/i) ||
                          text.match(/(?:aç|açar mısın|başlat|çalıştır)\s+([a-zçğıöşü]+)/i);
        if (openMatch) {
            const app = this._resolveApp(openMatch[1]);
            if (app) return { type: "open", app };
        }

        if (lower.includes("ara") && (lower.includes("telefon") || /\+?\d[\d\s]{6,}/.test(text))) {
            const numMatch = text.match(/\+?\d[\d\s]{6,}/);
            return { type: "call", number: numMatch ? numMatch[0].trim() : null };
        }

        if (lower.includes("sms") || lower.includes("mesaj at") || lower.includes("mesaj gönder") || lower.includes("sms gönder") || lower.includes("mesaj yaz") || lower.includes("mesajı at") || lower.includes("mesajı gönder")) {
            const numMatch = text.match(/\+?\d[\d\s]{6,}/);
            let message = null;
            if (numMatch) {
                const afterNum = text.slice(text.indexOf(numMatch[0]) + numMatch[0].length);
                const cleaned = afterNum
                    .replace(/^\s*(?:ye|ya|na|ne|kişisine|numarasına)\s+/i, "")
                    .replace(/\s*(?:mesajı|mesaj)\s*(?:at|gönder|yaz)?\s*$/i, "")
                    .replace(/\s*(?:at|gönder|yaz)\s*$/i, "")
                    .trim();
                if (cleaned.length >= 2) message = cleaned;
            }
            return {
                type: "sms",
                number: numMatch ? numMatch[0].trim() : null,
                message: message
            };
        }

        if (lower.includes("alarm kur") || lower.includes("alarm")) {
            let timeMatch = text.match(/(\d{1,2}[:.]\d{2})/);
            if (!timeMatch) timeMatch = text.match(/(\d{1,2})\s*(?:sabah|akşam|\'?[eya])/i);
            return { type: "alarm", time: timeMatch ? timeMatch[1] : null };
        }

        if (lower.includes("hatırlat") || lower.includes("hatirlat")) {
            const timeMatch = text.match(/(\d{1,2}[:.]\d{2}|yarın|bugün)/i);
            const textMatch = text.match(/(?:hatırlat|hatirlat)[:\s]+(.+)/i);
            return {
                type: "reminder",
                time: timeMatch ? timeMatch[1] : null,
                text: textMatch ? textMatch[1].trim() : null
            };
        }

        if (lower.includes("müzik aç") || lower.includes("müzik çal") || lower.includes("muzik cal") || lower.includes("müzik dinle") || lower.includes("şarkı aç") || lower.includes("şarkı çal")) {
            const qMatch = text.match(/(?:müzik|muzik|şarkı|sarki)\s+(?:aç|çal|cal|dinle)[:\s]*([a-zçğıöşü0-9 ]+)/i);
            return { type: "music", query: qMatch ? qMatch[1].trim() : null };
        }

        if (lower.includes("wifi aç") || lower.includes("wifi kapat") || lower.includes("wi-fi")) {
            const action = lower.includes("kapat") ? "off" : "on";
            return { type: "setting", key: "wifi", value: action };
        }

        if (lower.includes("bluetooth")) {
            const action = lower.includes("kapat") ? "off" : "on";
            return { type: "setting", key: "bluetooth", value: action };
        }

        if ((lower.includes("sesi") || lower.includes("ses")) && (lower.includes("aç") || lower.includes("kıs") || lower.includes("kapat"))) {
            const action = lower.includes("kapat") || lower.includes("kıs") ? "down" : "up";
            return { type: "setting", key: "volume", value: action };
        }

        if (lower.includes("el feneri") || lower.includes("feneri aç") || lower.includes("flaş") || lower.includes("flash")) {
            const action = lower.includes("kapat") ? "off" : "on";
            return { type: "setting", key: "flashlight", value: action };
        }

        return null;
    }

    _resolveApp(word) {
        const w = String(word || "").toLowerCase().trim();
        if (APP_ALIASES[w]) return APP_ALIASES[w];
        for (const key of Object.keys(APP_ALIASES)) {
            if (w.includes(key) || key.includes(w)) {
                return APP_ALIASES[key];
            }
        }
        return null;
    }

    async execute(text) {
        const detected = this.detect(text);
        if (!detected) return null;

        const available = await this._checkBridge();

        if (!available) {
            return this._fallback(detected);
        }

        let ok = false;
        let label = "";

        switch (detected.type) {
            case "open":
                ok = await this.bridge.open(detected.app);
                label = detected.app + " uygulamasını açtım.";
                break;
            case "call":
                if (!detected.number) return "Hangi numarayı aramamı istersin?";
                ok = await this.bridge.call(detected.number);
                label = detected.number + " numarasını arıyorum.";
                break;
            case "sms":
                if (!detected.number) return "Hangi numaraya mesaj göndereyim?";
                if (!detected.message) return "Mesajın içeriğini yaz.";
                ok = await this.bridge.sms(detected.number, detected.message);
                label = detected.number + " numarasına mesaj gönderdim.";
                break;
            case "alarm":
                if (!detected.time) return "Alarm saat kaçta kurulsun?";
                ok = await this.bridge.alarm(detected.time, "Jarvis alarm");
                label = "Alarmı " + detected.time + " için kurdum.";
                break;
            case "reminder":
                ok = await this.bridge.reminder(detected.time || "1 saat", detected.text || "");
                label = "Hatırlatma kurdum: " + (detected.text || "");
                break;
            case "music":
                ok = await this.bridge.playMusic(detected.query || "");
                label = "Müzik açıyorum" + (detected.query ? ": " + detected.query : "") + ".";
                break;
            case "setting":
                ok = await this.bridge.setSetting(detected.key, detected.value);
                label = this._settingLabel(detected.key, detected.value);
                break;
        }

        return ok ? "✅ " + label : "❌ Telefon komutu başarısız oldu.";
    }

    _fallback(detected) {
        const tips = {
            open: "Telefon bridge bulunamadı. Telefonunda Jarvis companion uygulamasını aç; '" + detected.app + "' uygulamasını kendim açamıyorum.",
            call: "Telefon köprüsü yok. Numarayı " + detected.number + " olarak elle aramalısın.",
            sms: "Telefon köprüsü yok. Mesajı elle göndermen gerek.",
            alarm: "Telefon köprüsü yok. Alarmı elle kur: " + (detected.time || "") + ".",
            reminder: "Not aldım: " + (detected.text || "") + ". Telefon köprüsü olmadığından hatırlatmayı elle ayarla.",
            music: "Telefon köprüsü yok. Müzik uygulamasını elle aç.",
            setting: "Telefon köprüsü yok. Ayarı elle değiştir."
        };
        return "⚠️ " + (tips[detected.type] || "Telefon komutu için köprü gerekli.");
    }

    _settingLabel(key, value) {
        const map = {
            wifi: value === "on" ? "Wi-Fi açıldı." : "Wi-Fi kapatıldı.",
            bluetooth: value === "on" ? "Bluetooth açıldı." : "Bluetooth kapatıldı.",
            flashlight: value === "on" ? "El feneri açıldı." : "El feneri kapatıldı.",
            volume: value === "up" ? "Ses açıldı." : "Ses kısıldı."
        };
        return map[key] || "Ayar güncellendi.";
    }

}

module.exports = new PhoneApi();
