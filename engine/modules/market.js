"use strict";

class Market{

    async run(engine,prompt){

        return await engine.ai.ask(
            "Bir finans uzmanı gibi cevap ver:\n\n"+prompt
        );

    }

}

module.exports=new Market();
