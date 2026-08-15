"use strict";

const { execFileSync } = require("child_process");

class TestEngine {

    checkSyntax(file) {

        try {

            execFileSync(
                process.execPath,
                ["--check", file],
                {
                    stdio: "pipe"
                }
            );

            return {
                ok: true,
                file
            };

        } catch (err) {

            return {
                ok: false,
                file,
                error: String(
                    err.stderr ||
                    err.message
                ).trim()
            };

        }

    }

    async run(files = []) {

        const results = [];

        for (const file of files) {

            results.push(
                this.checkSyntax(file)
            );

        }

        const failed =
            results.filter(
                result => !result.ok
            );

        return {
            ok: failed.length === 0,
            checked: results.length,
            failed,
            results
        };

    }

}

module.exports = TestEngine;
