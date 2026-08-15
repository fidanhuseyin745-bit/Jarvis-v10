"use strict";

const { spawn, execSync } = require("child_process");
const fs = require("fs");

class ServiceManager{

    isRunning(port){

        try{

            execSync(`curl -s http://127.0.0.1:${port}`);

            return true;

        }catch{

            return false;

        }

    }

    start(name,dir,file,port){

        if(this.isRunning(port)){

            console.log("✅ "+name+" zaten çalışıyor.");
            return;

        }

        if(!fs.existsSync(dir+"/"+file)){

            console.log("❌ "+name+" bulunamadı.");
            return;

        }

        console.log("🚀 "+name+" başlatılıyor...");

        const child=spawn("node",[file],{

            cwd:dir,
            detached:true,
            stdio:"ignore"

        });

        child.unref();

    }

    boot(){

        this.start(
            "Web API",
            process.env.HOME+"/Jarvis-v6/webserver",
            "index.js",
            3000
        );

        this.start(
            "AI API",
            process.env.HOME+"/Jarvis-AI",
            "server.js",
            9000
        );

        console.log("✅ Servis kontrolü tamamlandı.");

    }

}

module.exports=new ServiceManager();
