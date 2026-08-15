"use strict";

class Planner{

    create(state){

        const plan=[];

        if(state.memory)
            plan.push("memory");

        if(state.news)
            plan.push("web");

        if(state.market)
            plan.push("market");

        if(state.study)
            plan.push("study");

        if(state.phone)
            plan.push("phone");

        if(state.coding)
            plan.push("coding");

        if(plan.length===0)
            plan.push("chat");

        return plan;

    }

}

module.exports=new Planner();
