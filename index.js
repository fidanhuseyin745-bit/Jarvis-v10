"use strict";

const readline=require("readline");
const jarvis=require("./core/jarvis");
const serviceManager=require("./services/serviceManager");

serviceManager.boot();

const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout,
    prompt:"Jarvis > "
});

console.log("🤖 Jarvis v7 Başlatıldı");

rl.prompt();

rl.on("line",async(line)=>{

    line=line.trim();

    if(line==="exit"){
        process.exit(0);
    }

    try{

        await jarvis.execute(line);

    }catch(err){

        console.log("❌ "+err.message);

    }

    rl.prompt();

});
