"use strict";

const os = require("os");

/**
 * SystemSkill — yerel sistem bilgileri (AI/bağlantı gerektirmez).
 * "sistem bilgisi", "bellek durumu", "disk" gibi istekleri yanıtlar.
 */
module.exports = {
    name: "System",

    match(text) {
        return /sistem|bellek|ram|disk|cpu|işlemci|islemei|platform|uptime|hostname/i.test(text);
    },

    async run(input) {
        if (/bellek|ram/i.test(input)) {
            return "💾 Bellek:\n" +
                "Toplam: " + this._mb(os.totalmem()) + " MB\n" +
                "Boş: " + this._mb(os.freemem()) + " MB\n" +
                "Kullanılan: " + this._mb(os.totalmem() - os.freemem()) + " MB";
        }
        if (/cpu|işlemci|islemei/i.test(input)) {
            return "⚙️ İşlemci:\nModel: " + os.cpus()[0].model + "\nÇekirdek: " + os.cpus().length;
        }
        if (/disk/i.test(input)) {
            try {
                const stat = require("fs").statSync(process.cwd());
                return "💽 Disk bilgisi için 'df -h' komutunu çalıştırabilirsin.";
            } catch (e) {
                return "Disk bilgisi alınamadı.";
            }
        }
        return "🖥️ Sistem bilgisi:\n" +
            "Platform: " + os.platform() + " " + os.arch() + "\n" +
            "Hostname: " + os.hostname() + "\n" +
            "Uptime: " + Math.floor(os.uptime() / 60) + " dk\n" +
            "Kullanıcı: " + os.userInfo().username;
    },

    _mb(bytes) {
        return Math.round(bytes / 1024 / 1024);
    }
};
