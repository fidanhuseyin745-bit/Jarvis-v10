"use strict";

const DiagnosticEngine = require("./diagnosticEngine");
const ImprovementPlanner = require("./improvementPlanner");
const TestEngine = require("./testEngine");

class SelfManager {

    constructor(root) {

        this.root = root;

        this.diagnostic =
            new DiagnosticEngine(root);

        this.planner =
            new ImprovementPlanner();

        this.tester =
            new TestEngine();

        this.mode = "DRY_RUN";

    }

    async inspect() {

        console.log(
            "\n🧠 Self-Improvement başlıyor..."
        );

        const diagnostic =
            await this.diagnostic.scan();

        console.log(
            `🔍 ${diagnostic.checked} dosya kontrol edildi.`
        );

        const plan =
            this.planner.createPlan(
                diagnostic
            );

        if (!plan.actionable) {

            return {
                success: true,
                changed: false,
                mode: this.mode,
                diagnostic,
                plan
            };

        }

        /*
         * DRY_RUN:
         * Hiçbir dosyaya dokunma.
         */

        if (this.mode === "DRY_RUN") {

            return {
                success: true,
                changed: false,
                mode: this.mode,
                diagnostic,
                plan,
                message:
                    "Değişiklik önerildi fakat DRY_RUN nedeniyle uygulanmadı."
            };

        }

        return {
            success: false,
            changed: false,
            mode: this.mode,
            diagnostic,
            plan,
            message:
                "AUTO modu henüz etkin değil."
        };

    }

}

module.exports = SelfManager;
