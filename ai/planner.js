"use strict";

const reasoning = require("./reasoning");

class Planner {

    async createPlan(input) {

        const plan = await reasoning.think(input);

        plan.status = "READY";
        plan.createdAt = new Date().toISOString();

        return plan;
    }

}

module.exports = new Planner();
