"use strict";

require("dotenv").config();
const axios=require("axios");

class Coder{

    async ask(prompt){

        try{

            const res=await axios.post(
                process.env.AI_URL,
                {
                    model:process.env.MODEL,
                    messages:[
                        {
                            role:"user",
                            content:prompt
                        }
                    ],
                    stream:false
                },
                {
                    timeout:60000,
                    headers:{
                        "Content-Type":"application/json"
                    }
                }
            );

            if(
                !res.data ||
                !res.data.choices ||
                !res.data.choices.length
            ){
                return "AI cevap vermedi.";
            }

            return res.data.choices[0].message.content;

        }catch(err){

            if(err.response){
                return "AI Hatası: "+JSON.stringify(err.response.data);
            }

            return "Bağlantı Hatası: "+err.message;

        }

    }

}

module.exports=Coder;
