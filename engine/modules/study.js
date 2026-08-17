"use strict";

class Study{

    async run(engine,prompt,context){

        return await engine.ai.ask(
            "Bir öğretmen gibi cevap ver:\n\n"+prompt,
            context
        );

    }

}

module.exports=new Study();
