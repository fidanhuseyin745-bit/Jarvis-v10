'use strict';

const fs=require('fs');

class Logger{

constructor(){

this.file='jarvis.log';

}

write(type,msg){

const line=`[${new Date().toISOString()}] ${type} ${msg}\n`;

fs.appendFileSync(this.file,line);

}

info(msg){

this.write('INFO',msg);

}

error(msg){

this.write('ERROR',msg);

}

}

module.exports=Logger;
