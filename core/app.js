'use strict';

const readline=require('node:readline/promises');
const {stdin,stdout}=require('node:process');

const AIManager=require("./aiManager");
const Brain=require("../kernel/brain/brainPipeline");

class App{

constructor(){

this.ai=new AIManager();
this.brain=Brain;

}

async start(){

const rl=readline.createInterface({
input:stdin,
output:stdout
});

console.log("🤖 Jarvis v6 Başladı");

while(true){

const cmd=(await rl.question("Jarvis > ")).trim();

if(!cmd) continue;

if(cmd==="çık") break;

try{

const result=await this.brain.run(cmd,this.ai);

console.log("");

console.log("🧠 Intent :",result.decision.intent);
console.log("🤖 Agent  :",result.decision.agent);

console.log("");

console.log("📋 Pipeline");

result.execution.forEach((x,i)=>{

console.log((i+1)+".",x.agent,"=>",x.status);

});

}catch(e){

console.log("❌",e.message);

}

}

rl.close();

if(this.ai.stopServer)
this.ai.stopServer();

}

}

module.exports=App;
