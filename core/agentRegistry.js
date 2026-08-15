"use strict";

class AgentRegistry{

constructor(){

this.agents={};

}

register(name,agent){

this.agents[name]=agent;

}

get(name){

return this.agents[name];

}

list(){

return Object.keys(this.agents);

}

}

module.exports=new AgentRegistry();
