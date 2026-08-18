"use strict";

const fs = require("fs");
const path = require("path");

class ModuleBuilder {

    constructor() {
        this.apiDir = path.join(__dirname, "..", "api");
        this.moduleDir = path.join(__dirname, "..", "engine", "modules");
        this.registryFile = path.join(this.apiDir, "moduleRegistry.json");
        this._ensureRegistry();
    }

    _ensureRegistry() {
        if (!fs.existsSync(this.registryFile)) {
            fs.writeFileSync(this.registryFile, JSON.stringify({ modules: [] }, null, 2));
        }
    }

    _readRegistry() {
        try {
            return JSON.parse(fs.readFileSync(this.registryFile, "utf8"));
        } catch {
            return { modules: [] };
        }
    }

    _writeRegistry(reg) {
        fs.writeFileSync(this.registryFile, JSON.stringify(reg, null, 2));
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();

        if (lower.includes("modül listele") || lower.includes("modul listele") ||
            lower.includes("modüllerim") || lower.includes("modullerim")) {
            return { type: "list" };
        }

        const addMatch = text.match(/(?:modül ekle|modul ekle|yeni modül|yeni modul)\s*[:\s]*\s*([a-z0-9_]+)/i);
        if (addMatch) {
            const name = addMatch[1].toLowerCase().replace(/[^a-z0-9_]/g, "");
            return { type: "create", name };
        }

        const delMatch = text.match(/(?:modül sil|modul sil|modül kaldır|modul kaldir)\s*[:\s]*\s*([a-z0-9_]+)/i);
        if (delMatch) {
            return { type: "delete", name: delMatch[1].toLowerCase().replace(/[^a-z0-9_]/g, "") };
        }

        return null;
    }

    execute(text, options) {
        const detected = this.detect(text);
        if (!detected) return null;

        switch (detected.type) {
            case "list":
                return this._listModules();
            case "create":
                return this._createModule(detected.name, text, options);
            case "delete":
                return this._deleteModule(detected.name);
            default:
                return null;
        }
    }

    _listModules() {
        const reg = this._readRegistry();
        const builtIn = this._listBuiltIn();
        const custom = reg.modules || [];

        const lines = ["📦 Jarvis modülleri:"];
        lines.push("\n🔧 Yerleşik (" + builtIn.length + "):");
        builtIn.forEach(m => lines.push("  • " + m));

        if (custom.length) {
            lines.push("\n✨ Eklediğim (" + custom.length + "):");
            custom.forEach(m => {
                lines.push("  • " + m.name + " — " + (m.description || "(açıklama yok)"));
            });
        } else {
            lines.push("\n✨ Eklediğim: yok");
            lines.push("Eklemek için: 'modül ekle <isim>'");
        }
        return lines.join("\n");
    }

    _listBuiltIn() {
        return ["mathApi", "unitsApi", "timeApi", "textApi",
            "wikiApi", "weatherApi", "newsApi", "marketApi",
            "phoneApi", "githubApi", "codeGenApi", "moduleBuilder"];
    }

    _createModule(name, specText, options) {
        if (!name) return "Modül ismi gerekli. 'modül ekle <isim>' şeklinde deneyin.";
        if (["math", "units", "time", "text", "wiki", "weather",
            "news", "market", "phone", "github", "codeGen", "module"].includes(name)) {
            return "⚠️ '" + name + "' yerleşik modül ismiyle çakışıyor. Farklı bir isim seçin.";
        }

        const className = this._capitalize(name);
        const fileName = name + "Api.js";
        const filePath = path.join(this.apiDir, fileName);

        if (fs.existsSync(filePath)) {
            return "⚠️ '" + fileName + "' zaten var. Farklı bir isim kullanın veya 'modül sil " + name + "' ile kaldırın.";
        }

        const descMatch = specText.match(/(?:modül ekle|modul ekle)\s+[a-z0-9_]+\s*[:\s]*(.+)/i);
        const desc = descMatch ? descMatch[1].trim().slice(0, 100) : ("Jarvis tarafından oluşturulan " + name + " modülü");

        const code = `"use strict";

/**
 * ${className}Api — Jarvis tarafından oluşturulan modül
 * Açıklama: ${desc}
 * Oluşturulma: ${new Date().toISOString().slice(0, 10)}
 */

class ${className}Api {

    detect(text) {
        const lower = String(text || "").toLowerCase();
        if (!lower.includes("${name}")) return null;

        return { type: "${name}", text };
    }

    async execute(text) {
        const detected = this.detect(text);
        if (!detected) return null;

        // TODO: ${name} modülünün mantığını buraya ekleyin
        // detect() ile komut yakalayıp execute() ile işleyin
        // Örnek:
        //   if (lower.includes("${name} nedir")) return "${name} hakkında bilgi...";
        //   if (lower.includes("${name} yap")) return "${name} yapıldı";

        return "${name} modülü algılandı ama henüz mantığı yazılmadı. " +
               "${filePath} dosyasını düzenleyip execute() içini geliştirin.";
    }

}

module.exports = new ${className}Api();
`;

        try {
            fs.writeFileSync(filePath, code);
        } catch (e) {
            return "❌ Modül dosyası yazılamadı: " + e.message;
        }

        const reg = this._readRegistry();
        reg.modules.push({
            name: name,
            fileName: fileName,
            className: className + "Api",
            description: desc,
            created: new Date().toISOString().slice(0, 10)
        });
        this._writeRegistry(reg);

        return "✅ Yeni modül oluşturuldu: " + filePath + "\n\n" +
            "Modül ismi: " + name + "\n" +
            "Sınıf: " + className + "Api\n" +
            "Açıklama: " + desc + "\n\n" +
            "Bu modülü localEngine'e bağlamak için:\n" +
            "  1. ai/localEngine.js başına ekle:\n" +
            "     const " + name + "Api = require(\"../api/" + fileName + "\");\n" +
            "  2. ask() içine (phone'dan sonra) ekle:\n" +
            "     const " + name + "Res = await " + name + "Api.execute(text);\n" +
            "     if (" + name + "Res) return " + name + "Res;\n\n" +
            "Daha sonra '" + name + "...' yazınca modül devreye girecek.";
    }

    _deleteModule(name) {
        if (!name) return "Silinecek modül ismi gerekli.";

        const reg = this._readRegistry();
        const idx = reg.modules.findIndex(m => m.name === name);
        if (idx < 0) {
            return "⚠️ '" + name + "' adlı özel modül bulunamadı. Yerleşik modüller silinemez.";
        }

        const fileName = reg.modules[idx].fileName;
        const filePath = path.join(this.apiDir, fileName);
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {
            return "❌ Dosya silinemedi: " + e.message;
        }

        reg.modules.splice(idx, 1);
        this._writeRegistry(reg);

        return "✅ '" + name + "' modülü silindi. localEngine.js'den ilgili require ve çağrıyı kaldırmayı unutmayın.";
    }

    _capitalize(s) {
        return String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
    }

}

module.exports = new ModuleBuilder();
