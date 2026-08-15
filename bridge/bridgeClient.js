"use strict";

const axios=require("axios");

class BridgeClient{

    constructor(){
        this.url="http://127.0.0.1:8787";
    }

    async open(command){

        try{

            const params=new URLSearchParams();
            params.append("text",command);

            const r=await axios.post(
                this.url+"/bridge",
                params.toString(),
                {
                    headers:{
                        "Content-Type":"application/x-www-form-urlencoded"
                    }
                }
            );

            console.log("Bridge cevabı:",r.data);

            return r.data==="OK";

        }catch(e){

            console.log(e.message);

            return false;

        }

    }

}

module.exports=new BridgeClient();
