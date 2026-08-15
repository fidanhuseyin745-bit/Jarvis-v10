"use strict";

class ImprovementPlanner {

    createPlan(diagnostic) {

        if (!diagnostic) {

            return {
                actionable: false,
                reason: "Diagnostic sonucu bulunamadı."
            };

        }

        const errors =
            Array.isArray(diagnostic.errors)
                ? diagnostic.errors
                : [];

        if (errors.length === 0) {

            return {
                actionable: false,
                reason:
                    "Bilinen bir hata bulunamadı.",
                checked:
                    diagnostic.checked,
                errors: [],
                warnings:
                    Array.isArray(diagnostic.warnings)
                        ? diagnostic.warnings
                        : []
            };

        }

        const targets =
            errors.map(error => {

                if (
                    error.type ===
                    "missing_module"
                ) {

                    return {
                        file: error.file,
                        error: error.error,
                        type: "missing_module",
                        request: error.request
                    };

                }

                return {
                    file: error.file,
                    error: error.error,
                    type: "syntax"
                };

            });

        const hasMissingModule =
            targets.some(
                target =>
                    target.type ===
                    "missing_module"
            );

        return {

            actionable: true,

            type:
                hasMissingModule
                    ? "mixed_repair"
                    : "syntax_fix",

            priority: "high",

            targets,

            checked:
                diagnostic.checked,

            errorCount:
                targets.length,

            warnings:
                Array.isArray(diagnostic.warnings)
                    ? diagnostic.warnings
                    : []

        };

    }

}

module.exports = ImprovementPlanner;
