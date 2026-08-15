"use strict";

const ImprovementPlanner =
    require("./improvementPlanner");

const DiagnosticEngine =
    require("./diagnosticEngine");

const ProposalGenerator =
    require("./proposalGenerator");

const ProposalValidator =
    require("./proposalValidator");

const FixProposal =
    require("./fixProposal");

const RepairEngine =
    require("./repairEngine");

class SelfImprovementEngine {

    constructor(root) {

        this.root = root;

        this.diagnostic =
            new DiagnosticEngine(root);

        this.planner =
            new ImprovementPlanner();

        this.generator =
            new ProposalGenerator(root);

        this.validator =
            new ProposalValidator(root);

        this.repair =
            new RepairEngine(root);

    }

    async inspect() {

        const diagnostic =
            await this.diagnostic.scan();

        const plan =
            this.planner.createPlan(
                diagnostic
            );

        return {
            diagnostic,
            plan
        };

    }

    createProposals(plan) {

        if (
            !plan ||
            !plan.actionable ||
            !Array.isArray(plan.targets)
        ) {
            return [];
        }

        const proposals = [];

        for (const target of plan.targets) {

            const proposal =
                this.generator.generate(target);

            if (!proposal)
                continue;

            const validation =
                this.validator.validate(
                    proposal
                );

            proposals.push({
                proposal,
                validation
            });

        }

        return proposals;

    }

    async apply(proposal) {

        if (!proposal) {

            return {
                success: false,
                reason: "Proposal bulunamadı."
            };

        }

        const validation =
            this.validator.validate(
                proposal
            );

        if (!validation.valid) {

            return {
                success: false,
                stage: "validation",
                reason: validation.reason
            };

        }

        const fix =
            proposal instanceof FixProposal
                ? proposal
                : new FixProposal(proposal);

        return await this.repair.repair(
            fix
        );

    }

    async run(options = {}) {

        const dryRun =
            options.dryRun !== false;

        const inspection =
            await this.inspect();

        /*
         * Sistem temizse hiçbir şey yapma.
         */

        if (!inspection.plan.actionable) {

            return {
                success: true,
                changed: false,
                mode: dryRun
                    ? "DRY_RUN"
                    : "LIVE",
                diagnostic:
                    inspection.diagnostic,
                plan:
                    inspection.plan,
                proposals: []
            };

        }

        /*
         * Hatalar için güvenli proposal üret.
         */

        const proposals =
            this.createProposals(
                inspection.plan
            );

        const valid =
            proposals.filter(
                item => item.validation.valid
            );

        const rejected =
            proposals.filter(
                item => !item.validation.valid
            );

        /*
         * DRY_RUN:
         * Hiçbir dosyaya dokunma.
         */

        if (dryRun) {

            return {
                success: true,
                changed: false,
                mode: "DRY_RUN",
                diagnostic:
                    inspection.diagnostic,
                plan:
                    inspection.plan,
                proposals,
                validCount: valid.length,
                rejectedCount: rejected.length
            };

        }

        /*
         * LIVE:
         * Yalnızca Validator'dan geçen
         * proposal'ları RepairEngine'e gönder.
         */

        const results = [];

        for (const item of valid) {

            const result =
                await this.apply(
                    item.proposal
                );

            results.push({
                proposal:
                    item.proposal,
                result
            });

            /*
             * Bir düzeltme başarısızsa
             * sonraki otomatik değişikliklere
             * devam etme.
             */

            if (!result.success) {

                return {
                    success: false,
                    changed: results.some(
                        x =>
                            x.result &&
                            x.result.success
                    ),
                    mode: "LIVE",
                    diagnostic:
                        inspection.diagnostic,
                    plan:
                        inspection.plan,
                    proposals,
                    results,
                    stopped: true
                };

            }

        }

        /*
         * Son doğrulama.
         */

        const finalDiagnostic =
            await this.diagnostic.scan();

        return {
            success:
                finalDiagnostic.ok,
            changed:
                results.some(
                    x =>
                        x.result &&
                        x.result.success
                ),
            mode: "LIVE",
            diagnostic:
                inspection.diagnostic,
            plan:
                inspection.plan,
            proposals,
            results,
            finalDiagnostic
        };

    }

}

module.exports =
    SelfImprovementEngine;
