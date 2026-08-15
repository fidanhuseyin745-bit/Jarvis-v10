"use strict";

const fs = require("fs");
const path = require("path");

const FixProposal = require("./fixProposal");
const PatchEngine = require("./patchEngine");
const TestEngine = require("./testEngine");

class RepairEngine {

    constructor(root) {

        this.root =
            root || path.resolve(__dirname, "..");

        this.patch =
            new PatchEngine(this.root);

        this.test =
            new TestEngine();

    }

    createProposal(
        file,
        original,
        replacement,
        reason
    ) {

        return new FixProposal({
            file,
            original,
            replacement,
            reason,
            source: "repair-engine"
        });

    }

    applyProposal(proposal) {

        const absolute =
            path.resolve(
                this.root,
                proposal.file
            );

        /*
         * ==========================================
         * NEW FILE
         * ==========================================
         */

        if (
            proposal.type ===
            "missing_module"
        ) {

            if (fs.existsSync(absolute)) {

                throw new Error(
                    "Oluşturulacak dosya zaten mevcut: " +
                    proposal.file
                );

            }

            if (
                typeof proposal.replacement !==
                "string" ||
                !proposal.replacement.length
            ) {

                throw new Error(
                    "Yeni dosya içeriği boş."
                );

            }

            fs.mkdirSync(
                path.dirname(absolute),
                {
                    recursive: true
                }
            );

            fs.writeFileSync(
                absolute,
                proposal.replacement,
                "utf8"
            );

            return {
                success: true,
                file: proposal.file,
                created: true,
                backup: null
            };

        }

        /*
         * ==========================================
         * EXISTING FILE PATCH
         * ==========================================
         */

        if (!fs.existsSync(absolute)) {

            throw new Error(
                "Dosya bulunamadı: " +
                proposal.file
            );

        }

        const current =
            fs.readFileSync(
                absolute,
                "utf8"
            );

        if (
            !current.includes(
                proposal.original
            )
        ) {

            throw new Error(
                "Beklenen eski kod bulunamadı. " +
                "Patch uygulanmadı."
            );

        }

        const replacement =
            current.replace(
                proposal.original,
                proposal.replacement
            );

        return this.patch.apply(
            proposal.file,
            replacement
        );

    }

    async repair(proposal) {

        if (!proposal)
            throw new Error(
                "Proposal bulunamadı."
            );

        const record =
            this.applyProposal(
                proposal
            );

        const test =
            await this.test.run([
                path.resolve(
                    this.root,
                    proposal.file
                )
            ]);

        if (!test.ok) {

            /*
             * Yeni dosyaysa oluşturulan dosyayı sil.
             * Mevcut dosyaysa eski backup'ı geri yükle.
             */

            if (
                proposal.type ===
                "missing_module"
            ) {

                const absolute =
                    path.resolve(
                        this.root,
                        proposal.file
                    );

                if (
                    fs.existsSync(absolute)
                ) {
                    fs.unlinkSync(absolute);
                }

                return {
                    success: false,
                    rolledBack: true,
                    test
                };

            }

            this.patch.rollbackPatch(
                record
            );

            return {
                success: false,
                rolledBack: true,
                test
            };

        }

        return {
            success: true,
            rolledBack: false,
            test,
            record
        };

    }

}

module.exports =
    RepairEngine;
