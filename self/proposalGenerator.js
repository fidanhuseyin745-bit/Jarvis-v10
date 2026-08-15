"use strict";

const fs = require("fs");
const path = require("path");

class ProposalGenerator {

    constructor(root) {

        this.root =
            path.resolve(
                root || path.resolve(__dirname, "..")
            );

    }

    resolve(file) {

        const absolute =
            path.resolve(this.root, file);

        const relative =
            path.relative(this.root, absolute);

        if (
            relative.startsWith("..") ||
            path.isAbsolute(relative)
        ) {
            throw new Error(
                "Workspace dışındaki dosya reddedildi."
            );
        }

        return absolute;
    }

    extractContract(source) {

        const methods = [
            ...source.matchAll(
                /service\.([A-Za-z_$][\w$]*)\s*\(/g
            )
        ].map(
            match => match[1]
        );

        return {
            methods: [
                ...new Set(methods)
            ]
        };

    }

    generate(target) {

        if (
            !target ||
            !target.file ||
            !target.error
        ) {
            return null;
        }

        const absolute =
            this.resolve(target.file);

        if (!fs.existsSync(absolute))
            return null;

        const source =
            fs.readFileSync(
                absolute,
                "utf8"
            );

        const error =
            String(target.error);

        /*
         * ==========================================
         * SYNTAX FIX
         * ==========================================
         */

        if (
            /missing \) after argument list/i
                .test(error)
        ) {

            const location =
                error.match(/\.js:(\d+)/);

            if (!location)
                return null;

            const lineNumber =
                Number(location[1]);

            const lines =
                source.split("\n");

            const index =
                lineNumber - 1;

            if (
                index < 0 ||
                index >= lines.length
            ) {
                return null;
            }

            const originalLine =
                lines[index];

            const open =
                (originalLine.match(/\(/g) || [])
                    .length;

            const close =
                (originalLine.match(/\)/g) || [])
                    .length;

            if (open !== close + 1)
                return null;

            const semicolon =
                originalLine.lastIndexOf(";");

            if (semicolon === -1)
                return null;

            const replacementLine =
                originalLine.slice(0, semicolon) +
                ")" +
                originalLine.slice(semicolon);

            if (
                replacementLine ===
                originalLine
            ) {
                return null;
            }

            return {
                file: target.file,
                original: originalLine,
                replacement: replacementLine,
                reason:
                    "Eksik kapatma parantezi için güvenli syntax düzeltmesi.",
                source: "local-rule-engine"
            };

        }

        /*
         * ==========================================
         * MISSING MODULE
         * ==========================================
         */

        if (
            target.type === "missing_module" ||
            /Yerel modül bulunamadı:/i.test(error)
        ) {

            const request =
                target.request;

            if (
                typeof request !== "string" ||
                (
                    !request.startsWith("./") &&
                    !request.startsWith("../")
                )
            ) {
                return null;
            }

            let targetFile =
                path.resolve(
                    path.dirname(absolute),
                    request
                );

            if (!path.extname(targetFile)) {
                targetFile += ".js";
            }

            const relativeTarget =
                path.relative(
                    this.root,
                    targetFile
                );

            if (
                relativeTarget.startsWith("..") ||
                path.isAbsolute(relativeTarget)
            ) {
                return null;
            }

            const candidates = [
                targetFile,
                targetFile + ".js",
                targetFile + ".json",
                path.join(
                    targetFile,
                    "index.js"
                )
            ];

            if (
                candidates.some(
                    file => fs.existsSync(file)
                )
            ) {
                return null;
            }

            const contract =
                this.extractContract(
                    source
                );

            if (
                contract.methods.length === 0
            ) {
                return {
                    type: "missing_module",
                    file: target.file,
                    request,
                    target: relativeTarget,
                    original: "",
                    replacement: "",
                    reason:
                        "Eksik modül bulundu ancak beklenen API belirlenemedi.",
                    source: "local-rule-engine",
                    requiresGeneration: true,
                    contract
                };
            }

            /*
             * Sadece güvenli bir CommonJS iskeleti
             * oluşturuyoruz.
             *
             * Gerçek iş mantığı eklenmiyor.
             */

            const methodBody =
                contract.methods
                    .map(
                        method =>
                            `  ${method}() {\n` +
                            `    throw new Error("Method not implemented: ${method}");\n` +
                            `  }`
                    )
                    .join(",\n\n");

            const replacement =
                `"use strict";\n\n` +
                "module.exports = {\n" +
                methodBody +
                "\n};\n";

            return {
                type: "missing_module",
                file: relativeTarget,
                original: "",
                replacement,
                reason:
                    "Eksik modül için çağıran koddan çıkarılan " +
                    "API sözleşmesine uygun güvenli iskelet oluşturuldu.",
                source: "local-contract-engine",
                requiresGeneration: false,
                contract
            };

        }

        return null;

    }

}

module.exports =
    ProposalGenerator;
