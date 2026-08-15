"use strict";

const fs = require("fs");
const path = require("path");

class RollbackEngine {

    constructor(root) {

        this.root = root || path.resolve(__dirname, "..");

        this.backupDir = path.join(
            this.root,
            "self",
            "backups"
        );

        fs.mkdirSync(
            this.backupDir,
            { recursive: true }
        );

    }

    backup(file) {

        const absolute = path.resolve(
            this.root,
            file
        );

        if (!fs.existsSync(absolute)) {

            throw new Error(
                "Yedeklenecek dosya bulunamadı: " + file
            );

        }

        const id =
            Date.now() +
            "-" +
            path.basename(file)
                .replace(/[^a-zA-Z0-9._-]/g, "_");

        const backupPath =
            path.join(
                this.backupDir,
                id + ".bak"
            );

        fs.copyFileSync(
            absolute,
            backupPath
        );

        return {
            file,
            backupPath,
            createdAt:new Date().toISOString()
        };

    }

    restore(record) {

        if (
            !record ||
            !record.file ||
            !record.backupPath
        ) {

            throw new Error(
                "Geçersiz rollback kaydı."
            );

        }

        const target =
            path.resolve(
                this.root,
                record.file
            );

        if (!fs.existsSync(record.backupPath)) {

            throw new Error(
                "Backup bulunamadı: " +
                record.backupPath
            );

        }

        fs.copyFileSync(
            record.backupPath,
            target
        );

        return true;

    }

}

module.exports = RollbackEngine;
