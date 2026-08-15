"use strict";

class DecisionEngine {

    decide(plan){

        if(plan.confidence >= 0.90){

            plan.execute = true;
            plan.mode = "AUTO";

        }else{

            plan.execute = false;
            plan.mode = "ASK_USER";

        }

        return plan;

    }

}

module.exports = new DecisionEngine();
