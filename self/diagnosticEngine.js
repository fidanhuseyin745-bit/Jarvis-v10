"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

class DiagnosticEngine {

    constructor(root) {

        this.root =
            root || path.resolve(__dirname, "..");

        /*
         * Bazı dosyalar Jarvis'in kendi runtime bağımlılığı
         * değil; proje/template/legacy üretim kodudur.
         *
         * Bu dosyalardaki eksik require'lar ERROR yerine
         * WARNING olarak raporlanır.
         */
        this.warningFiles = new Set([
            "agents/codeGenerator.js",
            "agents/projectBuilder.js",
            "agents/templateAgent.js",
            "core/app.js",
            "core/patchManager.js"
        ]);

        this.scanDirs = [
            "agents",
            "ai",
            "bridge",
            "commands",
            "config",
            "core",
            "engine",
            "memory",
            "reasoner",
            "services",
            "skills",
            "utils",
            "project",
            "self"
        ];

    }

    getFiles() {

        const files = [];

        for (const dir of this.scanDirs) {

            const fullDir =
                path.join(this.root, dir);

            if (!fs.existsSync(fullDir))
                continue;

            this.walk(fullDir, files);

        }

        return files.filter(file =>
            file.endsWith(".js") &&
            !file.endsWith(".bak") &&
            !file.endsWith(".v1") &&
            !file.endsWith(".v2")
        );

    }

    walk(dir, files) {

        for (
            const entry of
            fs.readdirSync(
                dir,
                { withFileTypes: true }
            )
        ) {

            const fullPath =
                path.join(dir, entry.name);

            if (entry.isDirectory()) {

                this.walk(
                    fullPath,
                    files
                );

                continue;

            }

            files.push(fullPath);

        }

    }

    checkFile(file) {

        try {

            execFileSync(
                process.execPath,
                ["--check", file],
                {
                    stdio: "pipe"
                }
            );

            return {
                file,
                ok: true,
                error: null
            };

        } catch (err) {

            return {
                file,
                ok: false,
                error:
                    String(
                        err.stderr ||
                        err.message
                    ).trim()
            };

        }

    }

    extractLocalRequires(file) {

        const source =
            fs.readFileSync(
                file,
                "utf8"
            );

        const requires = [];

        const regex =
            /require\s*\(\s*["']([^"']+)["']\s*\)/g;

        let match;

        while ((match = regex.exec(source))) {

            const request =
                match[1];

            /*
             * Sadece yerel modüller.
             */
            if (
                !request.startsWith("./") &&
                !request.startsWith("../")
            ) {
                continue;
            }

            requires.push(request);

        }

        return requires;

    }

    resolveLocalModule(file, request) {

        const base =
            path.resolve(
                path.dirname(file),
                request
            );

        const candidates = [

            base,

            base + ".js",

            base + ".json",

            path.join(
                base,
                "index.js"
            )

        ];

        for (const candidate of candidates) {

            if (
                fs.existsSync(candidate) &&
                fs.statSync(candidate).isFile()
            ) {

                return candidate;

            }

        }

        return null;

    }

    checkDependencies(file) {

        let requires;

        try {

            requires =
                this.extractLocalRequires(
                    file
                );

        } catch (err) {

            return [];

        }

        const errors = [];

        for (const request of requires) {

            const resolved =
                this.resolveLocalModule(
                    file,
                    request
                );

            if (!resolved) {

                errors.push({

                    type: "missing_module",

                    file,

                    request,

                    error:
                        `Yerel modül bulunamadı: ${request}`

                });

            }

        }

        return errors;

    }

    async scan() {

        const files =
            this.getFiles();

        const syntaxResults =
            files.map(
                file => this.checkFile(file)
            );

        const syntaxErrors =
            syntaxResults.filter(
                result => !result.ok
            );

        const errors = [
            ...syntaxErrors
        ];

        const warnings = [];

        for (const result of syntaxResults) {

            if (!result.ok)
                continue;

            const dependencyErrors =
                this.checkDependencies(
                    result.file
                );

            const relative =
                path.relative(
                    this.root,
                    result.file
                );

            for (const error of dependencyErrors) {

                if (
                    this.warningFiles.has(relative)
                ) {

                    warnings.push({
                        ...error,
                        severity: "warning",
                        reason:
                            "Template/legacy dosya bağımlılığı."
                    });

                } else {

                    errors.push({
                        ...error,
                        severity: "error"
                    });

                }

            }

        }

        return {

            ok:
                errors.length === 0,

            checked:
                files.length,

            errors,

            warnings

        };

    }

}

module.exports =
    DiagnosticEngine;
