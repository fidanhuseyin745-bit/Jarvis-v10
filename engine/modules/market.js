"use strict";

class Market{

    async run(engine,prompt,context){

        return await engine.ai.ask(
            "Bir finans uzmanı gibi cevap ver:\n\n"+prompt,
            context
        );

    }

}

module.exports=new Market();
