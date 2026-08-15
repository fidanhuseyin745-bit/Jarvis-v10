"use strict";

const planner = require("./planner");
const router = require("./intentRouter");

class TaskEngine {

    async run(input) {

        console.log("\n🧠 Düşünüyorum...");

        const plan = await planner.createPlan(input);

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎯 Intent      :", plan.intent);
        console.log("📊 Confidence  :", plan.confidence);
        console.log("📅 Status      :", plan.status);
        console.log("🛠 Tools       :", plan.tools.join(", "));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

        for (const step of plan.steps) {
            console.log("➡ " + step);
        }

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        return await router.execute(plan, input);
    }

}

module.exports = new TaskEngine();
