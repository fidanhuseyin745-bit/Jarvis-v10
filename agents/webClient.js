'use strict';

const axios=require('axios');
const http=require('http');

const agent=new http.Agent({
    keepAlive:true,
    maxSockets:20
});

class WebClient{

  constructor(){
    this.base="http://127.0.0.1:3000";
  }

  async search(q){
    const r=await axios.get(this.base+"/search",{
      params:{q},
      timeout:5000,
      httpAgent:agent,
      headers:{
        "x-api-key":"jarvis-local-2026"
      }
    });
    return r.data;
  }

}

module.exports=WebClient;
