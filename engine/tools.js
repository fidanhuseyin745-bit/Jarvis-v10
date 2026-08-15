"use strict";

class Tools{

    async select(context){

        if(context.intent==="PHONE")
            return "phone";

        if(context.intent==="NEWS")
            return "internet";

        if(context.intent==="CODE")
            return "coder";

        return "chat";

    }

}

module.exports=Tools;
