"use strict";

class FixProposal {

    constructor({
        file,
        original,
        replacement,
        reason,
        source = "ai"
    }) {

        if (!file)
            throw new Error("FixProposal: dosya belirtilmedi.");

        if (typeof original !== "string")
            throw new Error("FixProposal: original string olmalı.");

        if (typeof replacement !== "string")
            throw new Error("FixProposal: replacement string olmalı.");

        this.file = file;
        this.original = original;
        this.replacement = replacement;
        this.reason = reason || "Belirtilmemiş";
        this.source = source;

        this.createdAt =
            new Date().toISOString();

    }

    summary() {

        return {
            file: this.file,
            reason: this.reason,
            source: this.source,
            originalLength: this.original.length,
            replacementLength: this.replacement.length,
            createdAt: this.createdAt
        };

    }

}

module.exports = FixProposal;
