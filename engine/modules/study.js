"use strict";

class Study{

    async run(engine,prompt){

        return await engine.ai.ask(
            "Bir öğretmen gibi cevap ver:\n\n"+prompt
        );

    }

}

module.exports=new Study();
