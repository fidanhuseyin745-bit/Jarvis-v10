"use strict";

class Parser{

    parse(input){

        input=String(input||"").trim();

        return{

            raw:input,
            input:input,
            text:input,
            createdAt:Date.now()

        };

    }

}

module.exports=new Parser();
