"use strict";

class ChatAgent{

    async run(text){

        console.log("🤖 Jarvis:",text);

        return true;

    }

}

module.exports=new ChatAgent();
