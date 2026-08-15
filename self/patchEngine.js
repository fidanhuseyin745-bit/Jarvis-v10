"use strict";

const fs = require("fs");
const path = require("path");
const RollbackEngine = require("./rollbackEngine");

class PatchEngine {

    constructor(root) {

        this.root = root || path.resolve(__dirname, "..");

        this.rollback = new RollbackEngine(this.root);

    }

    resolve(file) {

        const absolute = path.resolve(
            this.root,
            file
        );

        /*
         * Workspace dışına çıkılmasını engelle.
         */

        const relative = path.relative(
            this.root,
            absolute
        );

        if (
            relative.startsWith("..") ||
            path.isAbsolute(relative)
        ) {

            throw new Error(
                "Workspace dışındaki dosyaya erişim reddedildi: " +
                file
            );

        }

        return absolute;

    }

    apply(file, content) {

        if (typeof content !== "string") {

            throw new Error(
                "Patch içeriği string olmalı."
            );

        }

        const absolute = this.resolve(file);

        if (!fs.existsSync(absolute)) {

            throw new Error(
                "Dosya bulunamadı: " + file
            );

        }

        /*
         * Önce mevcut dosyanın yedeğini al.
         */

        const backup = this.rollback.backup(file);

        /*
         * Yeni içeriği yaz.
         */

        fs.writeFileSync(
            absolute,
            content,
            "utf8"
        );

        return {
            success: true,
            file,
            backup
        };

    }

    rollbackPatch(record) {

        if (
            !record ||
            !record.backup
        ) {

            throw new Error(
                "Geçerli patch kaydı bulunamadı."
            );

        }

        this.rollback.restore(
            record.backup
        );

        return {
            success: true,
            file: record.file
        };

    }

}

module.exports = PatchEngine;
