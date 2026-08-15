"use strict";

const bridge=require("../bridge/bridgeClient");

class PhoneAgent{

    async run(command){

        const ok=await bridge.open(command);

        if(ok){
            console.log("📱 "+command+" açıldı.");
        }else{
            console.log("❌ Uygulama açılamadı.");
        }

        return ok;

    }

}

module.exports=new PhoneAgent();
