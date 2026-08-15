"use strict";

const phone=require("../../agents/phoneAgent");

class Phone{

    async run(engine,prompt){

        await phone.run(prompt);

        return "Tamam.";

    }

}

module.exports=new Phone();
