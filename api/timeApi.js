"use strict";

class TimeApi {

    constructor() {
        this.days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
        this.months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                       "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();

        if (lower.includes("saat") && (lower.includes("kaç") || lower.includes("ne"))) {
            return "time";
        }

        if (lower.includes("bugün") && (lower.includes("günlerden") || lower.includes("ne") || lower.includes("hangi"))) {
            return "date";
        }

        if (lower.includes("tarih")) {
            return "date";
        }

        if (lower.includes("kaç gün") || lower.includes("gün fark")) {
            return "diff";
        }

        if (lower.includes("yaş") || lower.includes("kaç yaşında")) {
            return "age";
        }

        return null;
    }

    answer(text) {
        const type = this.detect(text);
        if (!type) return null;

        if (type === "time") return this.currentTime();
        if (type === "date") return this.currentDate();
        if (type === "age") return this.calcAge(text);
        if (type === "diff") return this.dateDiff(text);
        return null;
    }

    currentTime() {
        const now = new Date();
        const time = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        return `🕐 Şu an saat ${time}.`;
    }

    currentDate() {
        const now = new Date();
        const dayName = this.days[now.getDay()];
        const dateStr = now.getDate() + " " + this.months[now.getMonth()] + " " + now.getFullYear();
        const time = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        return `📅 Bugün ${dayName}, ${dateStr}. (Saat ${time})`;
    }

    calcAge(text) {
        const nums = text.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b/);
        if (!nums) {
            const yearMatch = text.match(/\b(19|20)\d{2}\b/);
            if (!yearMatch) return null;
            const birthYear = parseInt(yearMatch[0], 10);
            const age = new Date().getFullYear() - birthYear;
            return `🎂 Yaklaşık ${age} yaşındasın (doğum yılı ${birthYear}).`;
        }

        const day = parseInt(nums[1], 10);
        const month = parseInt(nums[2], 10);
        const year = parseInt(nums[3], 10);
        const birth = new Date(year, month - 1, day);
        const now = new Date();

        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }

        return `🎂 ${age} yaşındasın (doğum: ${day} ${this.months[month - 1]} ${year}).`;
    }

    dateDiff(text) {
        const dates = text.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b/g);
        if (!dates || dates.length < 2) return null;

        const parse = (s) => {
            const m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
            return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
        };

        const d1 = parse(dates[0]);
        const d2 = parse(dates[1]);
        const diffMs = Math.abs(d2 - d1);
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        return `📅 İki tarih arasında ${diffDays.toLocaleString("tr-TR")} gün var.`;
    }

}

module.exports = new TimeApi();
