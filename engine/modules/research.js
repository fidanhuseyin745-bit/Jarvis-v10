"use strict";

class Research{

    async run(engine,prompt){

        return await engine.ai.ask(
            "Konuyu derinlemesine araştır:\n\n"+prompt
        );

    }

}

module.exports=new Research();
