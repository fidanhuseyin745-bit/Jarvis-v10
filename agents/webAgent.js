"use strict";

const axios=require("axios");

class WebAgent{

    constructor(){

        this.baseURL="http://127.0.0.1:3000";
        this.apiKey="jarvis-local-2026";

    }

    async search(query){

        try{

            const res=await axios.get(

                this.baseURL+"/search",

                {

                    params:{q:query},

                    headers:{

                        "x-api-key":this.apiKey

                    }

                }

            );

            return res.data;

        }catch(err){

            return{

                success:false,

                error:err.message

            };

        }

    }

    async run(input){

        return await this.search(input);

    }

}

module.exports=new WebAgent();
