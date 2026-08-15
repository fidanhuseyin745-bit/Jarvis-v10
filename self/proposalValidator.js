"use strict";

const fs = require("fs");
const path = require("path");

class ProposalValidator {

    constructor(root) {

        this.root =
            path.resolve(
                root || path.resolve(__dirname, "..")
            );

        this.blocked = [
            "node_modules",
            ".git",
            "self/backups"
        ];

    }

    resolve(file) {

        const absolute =
            path.resolve(
                this.root,
                file
            );

        const relative =
            path.relative(
                this.root,
                absolute
            );

        if (
            relative.startsWith("..") ||
            path.isAbsolute(relative)
        ) {

            throw new Error(
                "Workspace dışındaki dosya reddedildi."
            );

        }

        return {
            absolute,
            relative
        };

    }

    isBlocked(relative) {

        for (const blocked of this.blocked) {

            if (
                relative === blocked ||
                relative.startsWith(
                    blocked + path.sep
                )
            ) {

                return blocked;

            }

        }

        return null;

    }

    validate(proposal) {

        if (!proposal) {

            return {
                valid: false,
                reason: "Proposal yok."
            };

        }

        if (!proposal.file) {

            return {
                valid: false,
                reason: "Dosya belirtilmemiş."
            };

        }

        if (
            typeof proposal.original !== "string" ||
            typeof proposal.replacement !== "string"
        ) {

            return {
                valid: false,
                reason:
                    "original/replacement string olmalı."
            };

        }

        let target;

        try {

            target =
                this.resolve(
                    proposal.file
                );

        } catch (err) {

            return {
                valid: false,
                reason: err.message
            };

        }

        const blocked =
            this.isBlocked(
                target.relative
            );

        if (blocked) {

            return {
                valid: false,
                reason:
                    "Korunan alan değiştirilemez: " +
                    blocked
            };

        }

        /*
         * ==========================================
         * NEW FILE / MISSING MODULE
         * ==========================================
         */

        if (
            proposal.type ===
            "missing_module"
        ) {

            if (fs.existsSync(target.absolute)) {

                return {
                    valid: false,
                    reason:
                        "Oluşturulacak dosya zaten mevcut."
                };

            }

            if (!proposal.replacement.length) {

                return {
                    valid: false,
                    reason:
                        "Yeni modül içeriği boş."
                };

            }

            if (
                proposal.original !== ""
            ) {

                return {
                    valid: false,
                    reason:
                        "Yeni modül proposal'ında " +
                        "original boş olmalı."
                };

            }

            if (
                proposal.requiresGeneration === true
            ) {

                return {
                    valid: false,
                    reason:
                        "Proposal hâlâ kod üretimi gerektiriyor."
                };

            }

            /*
             * Yeni dosyanın gerçekten JS modülü
             * olmasını bekliyoruz.
             */

            if (
                !target.relative.endsWith(".js")
            ) {

                return {
                    valid: false,
                    reason:
                        "Yeni modül .js dosyası olmalı."
                };

            }

            return {
                valid: true,
                mode: "create",
                file: target.relative,
                occurrences: 0
            };

        }

        /*
         * ==========================================
         * EXISTING FILE PATCH
         * ==========================================
         */

        if (!proposal.original.length) {

            return {
                valid: false,
                reason: "Original boş."
            };

        }

        if (!proposal.replacement.length) {

            return {
                valid: false,
                reason: "Replacement boş."
            };

        }

        if (!fs.existsSync(target.absolute)) {

            return {
                valid: false,
                reason:
                    "Dosya bulunamadı."
            };

        }

        const current =
            fs.readFileSync(
                target.absolute,
                "utf8"
            );

        const occurrences =
            current.split(
                proposal.original
            ).length - 1;

        if (occurrences !== 1) {

            return {
                valid: false,
                reason:
                    "Original kod tam olarak bir kez bulunmalı.",
                occurrences
            };

        }

        return {
            valid: true,
            mode: "patch",
            file: target.relative,
            occurrences: 1
        };

    }

}

module.exports = ProposalValidator;
