"use strict";

const knowledge = require("../knowledge/knowledgeBase");

class LocalEngine {

    constructor() {
        this.personality = {
            name: "Jarvis",
            polite: true,
            casual: false
        };
    }

    async ask(prompt, context) {
        const text = String(prompt || "").trim();
        const lower = text.toLowerCase();

        if (!text) {
            return "Bir şey yazmadın.";
        }

        if (this._isMath(lower)) {
            const math = this._evalMath(text);
            if (math !== null) return math;
        }

        if (this._isTimeQuery(lower)) {
            return this._timeAnswer(lower);
        }

        const fact = knowledge.search(lower);
        if (fact) {
            return this._formatFact(fact, lower);
        }

        return this._generate(text, lower, context);
    }

    _generate(text, lower, context) {
        if (this._isGreeting(lower)) {
            return this._greeting();
        }

        if (this._isThanks(lower)) {
            return "Rica ederim! Başka bir şey istersen buradayım.";
        }

        if (this._isBye(lower)) {
            return "Görüşmek üzere! İstediğin zaman buradayım.";
        }

        if (lower.includes("öğret") || lower.includes("bunu öğren") || lower.includes("unutma")) {
            return this._learnInstruction(text);
        }

        if (lower.includes("unut") || lower.includes("sil hafıza") || lower.includes("temizle")) {
            knowledge.forget();
            return "Öğrendiğim bilgileri temizledim.";
        }

        if (lower.includes("ne biliyorsun") || lower.includes("neler yapabilirsin") || lower.includes("yardım")) {
            return this._help();
        }

        if (lower.includes("ne öğrendin") || lower.includes("neler biliyorsun")) {
            return this._learnedSummary();
        }

        const autoLearned = this._tryAutoLearn(text, lower);
        if (autoLearned) {
            return autoLearned;
        }

        if (this._isQuestion(lower)) {
            return this._question(text, lower, context);
        }

        if (context && context.recent && context.recent.length > 0) {
            const last = context.recent[context.recent.length - 1];
            if (last.reply) {
                return "Önceki konuyu hatırlıyorum. Daha derinleşmemi ister misin?";
            }
        }

        return this._converse(text, lower, context);
    }

    _isGreeting(lower) {
        const greetings = ["merhaba", "selam", "naber", "hey", "günaydın", "iyi akşamlar", "hoşçakal"];
        return greetings.some(g => lower === g || lower.startsWith(g + " ") || lower.startsWith(g + "!"));
    }

    _greeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Günaydın! Ben Jarvis. Bugün sana nasıl yardımcı olabilirim?";
        if (hour < 18) return "Merhaba! Ben Jarvis. Ne yapalım?";
        return "İyi akşamlar! Ben Jarvis. Sana nasıl yardımcı olabilirim?";
    }

    _isThanks(lower) {
        return ["teşekkür", "sağ ol", "sag ol", "eyvallah", "mersi"].some(t => lower.includes(t));
    }

    _isBye(lower) {
        return ["hoşçakal", "hosca kal", "görüşürüz", "gorusuruz", "bay bay", "kapat"].some(t => lower.includes(t));
    }

    _isQuestion(lower) {
        const markers = ["nedir", "kimdir", "nasıl", "neden", "niçin", "niye", "ne zaman", "nerede",
                         "nerede", "nereye", "hangi", "kaç", "ne kadar", "mı", "mi", "mu", "mü"];
        return markers.some(m => lower.includes(m));
    }

    _question(text, lower, context) {
        const subject = this._extractSubject(lower);

        if (subject) {
            const parts = [];
            parts.push("Bildiğim kadarıyla:");

            if (lower.includes("nedir") || lower.includes("kimdir")) {
                parts.push(subject + " hakkında şu bilgileri verebilirim:");
                parts.push("• Temel tanımı ve genel kullanımı");
                parts.push("• Önemli özellikleri");
                parts.push("• İlgili bağlamlar");
            } else if (lower.includes("nasıl")) {
                parts.push(subject + " ile ilgili adımlar:");
                parts.push("• Önce konuyu netleştir");
                parts.push("• Gerekli araçları/hazırlığı yap");
                parts.push("• Adım adım uygula");
            } else if (lower.includes("neden") || lower.includes("niçin")) {
                parts.push(subject + " hakkında olası nedenler:");
                parts.push("• Temel mekanizması");
                parts.push("• Etkileyen faktörler");
            } else {
                parts.push(subject + " hakkında daha fazla bilgi istiyorsan, bana öğretebilirsin.");
            }

            if (context && context.recent && context.recent.length > 1) {
                parts.push("\n(Önceki konuşmamızı hatırlıyorum.)");
            }

            return parts.join("\n");
        }

        return "Bu ilginç bir soru. Tam olarak neyi merak ettiğini biraz daha açabilir misin?";
    }

    _extractSubject(lower) {
        const cleaned = lower
            .replace(/[?]/g, "")
            .replace(/\b(nedir|kimdir|nasıl|neden|niçin|niye|ne zaman|nerede|nerede|hangi|ne kadar|mi|mı|mu|mü)\b/g, "")
            .replace(/\b(bir|the|a|an|ile|ve|için|bu|şu|hakkında|hakkinda)\b/g, "")
            .trim();

        if (!cleaned) return null;

        const words = cleaned.split(/\s+/).filter(w => w.length > 2);
        return words.length ? words.join(" ") : null;
    }

    _converse(text, lower, context) {
        if (context && context.recent) {
            const recentTopic = this._recentTopic(context.recent);
            if (recentTopic) {
                return "Anlıyorum. '" + recentTopic + "' konusunu konuşmuştuk. Buna devam etmek ister misin, yoksa yeni bir konuya mı geçelim?";
            }
        }

        return "Anladım. Bunun hakkında daha fazla şey söyleyebilir misin? Merak ediyorum.";
    }

    _recentTopic(recent) {
        if (!recent || !recent.length) return null;
        const last = recent[recent.length - 1];
        if (!last.prompt) return null;
        const words = last.prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        return words.length ? words.slice(0, 3).join(" ") : null;
    }

    _learnInstruction(text) {
        const lower = text.toLowerCase();
        const match = text.match(/(?:öğret|bunu öğren|unutma)[:\s]*(.+)/i);
        if (match && match[1]) {
            const content = match[1].trim();
            knowledge.learn(content.slice(0, 60), content);
            return "Tamam, bunu öğrendim: " + content.slice(0, 80);
        }
        return "Bana bir şey öğretmek istiyorsan, 'öğret: ...' şeklinde yazabilirsin.";
    }

    _tryAutoLearn(text, lower) {
        if (lower.length < 15) return null;

        const hasNumber = /\d/.test(text);
        const wordCount = lower.split(/\s+/).length;
        const hasCommaDef = /^[^,]{3,40},\s+(.{8,80})/.test(text);

        const endsWithInfo =
            lower.endsWith("'dir") || lower.endsWith("tir") ||
            lower.endsWith("'dır") || lower.endsWith("tır") ||
            lower.endsWith("'dir.") || lower.endsWith("tir.") ||
            lower.endsWith("'dır.") || lower.endsWith("tır.") ||
            lower.endsWith("'dir") || lower.endsWith("dır");

        const defMatch = text.match(/^(.{3,40})\s+(?:şudur|şöyledir)[:\s]*(.+)/i);
        if (defMatch) {
            const subject = defMatch[1].trim();
            const def = defMatch[2].trim();
            knowledge.learn(subject, subject + " " + def);
            return "Anladım, " + subject + " hakkında not aldım.";
        }

        const meansMatch = text.match(/^(.{3,40})\s+(?:demek|demektir)\s*(.{3,80})?/i);
        if (meansMatch) {
            const subject = meansMatch[1].trim();
            knowledge.learn(subject, text);
            return "Not aldım: " + text.slice(0, 80);
        }

        if (endsWithInfo || (hasNumber && wordCount >= 4) || (hasCommaDef && wordCount >= 4)) {
            const cleaned = text.replace(/\.$/, "").trim();
            knowledge.learn(cleaned.slice(0, 60), cleaned);
            return "Not aldım: " + cleaned.slice(0, 80);
        }

        return null;
    }

    _learnedSummary() {
        const stats = knowledge.list();
        if (stats.learned === 0) {
            return "Henüz bana öğretilen bir bilgi yok. 'öğret: ...' ile bilgi verebilirsin.";
        }

        const recent = knowledge.learned
            .slice(-5)
            .reverse()
            .map((e, i) => (i + 1) + ". " + (e.response || e.pattern).slice(0, 60))
            .join("\n");

        return "Şu ana kadar " + stats.learned + " şey öğrendim. Son öğrendiklerim:\n" + recent;
    }

    _help() {
        const lines = [
            "Ben Jarvis. İşte yapabildiklerim:",
            "",
            "💬 Sohbet — Benimle normal konuş",
            "📚 Bilgi — 'bitcoin nedir', 'ışık hızı' gibi sorular sor",
            "🧮 Hesaplama — '15 * 24' veya '100 / 4' gibi matematik işlemleri",
            "🕐 Saat/Tarih — 'saat kaç', 'bugün ne'",
            "🧠 Öğrenme — 'öğret: ...' ile bana bilgi ver",
            "🗑️ Unutma — 'unut' ile öğrendiklerimi temizle",
            "📰 Haber — 'bugün haberleri'",
            "📈 Piyasa — 'bitcoin fiyatı'",
            "🔍 Araştırma — '... araştır'",
            "",
            "Hafızam var, geçmiş konuşmalarımızı hatırlıyorum."
        ];
        return lines.join("\n");
    }

    _formatFact(fact, lower) {
        if (fact.type === "function") {
            return this._timeAnswer(lower);
        }
        return fact.text;
    }

    _isMath(lower) {
        const cleaned = lower.replace(/\s/g, "");
        return /^[\d+\-*/.(),%]+$/.test(cleaned) && /[+\-*/]/.test(cleaned);
    }

    _evalMath(text) {
        const expr = text.replace(/[^0-9+\-*/.()]/g, "");
        if (!expr) return null;

        try {
            if (!/^[\d+\-*/.()]+$/.test(expr)) return null;

            const result = Function('"use strict"; return (' + expr + ")")();
            if (typeof result !== "number" || !isFinite(result)) return null;

            let formatted = String(result);
            if (Number.isInteger(result)) {
                formatted = result.toLocaleString("tr-TR");
            }

            return "🧮 " + expr + " = " + formatted;
        } catch {
            return null;
        }
    }

    _isTimeQuery(lower) {
        return ["saat kaç", "saat ne", "bugün günlerden ne", "bugün ne", "tarih ne", "hangi gün", "hangigün"].some(t => lower.includes(t));
    }

    _timeAnswer(lower) {
        const now = new Date();
        const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
        const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

        const time = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const dayName = days[now.getDay()];
        const dateStr = now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear();

        if (lower.includes("saat")) {
            return "🕐 Şu an saat " + time + ". (" + dayName + ", " + dateStr + ")";
        }
        return "📅 Bugün " + dayName + ", " + dateStr + ". (Saat " + time + ")";
    }

    async learn(pattern, response) {
        knowledge.learn(pattern, response);
    }

}

module.exports = LocalEngine;
