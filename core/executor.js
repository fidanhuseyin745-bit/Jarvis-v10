"use strict";

class Executor{

async execute(agent,input){

if(!agent){
return {success:false,error:"Agent bulunamadı"};
}

if(typeof agent.run!=="function"){
return {success:false,error:"Agent.run yok"};
}

const start=Date.now();

const result=await agent.run(input);

return{
success:true,
time:Date.now()-start,
result
};

}

}

module.exports=Executor;
