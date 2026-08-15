"use strict";

require("dotenv").config();

module.exports={

    aiUrl:process.env.AI_URL,

    model:process.env.MODEL,

    debug:process.env.DEBUG==="true"

};
