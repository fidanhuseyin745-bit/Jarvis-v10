'use strict';

const {execSync}=require('child_process');

class Terminal{

run(cmd){

console.log(execSync(cmd,{
encoding:'utf8'
}));

}

}

module.exports=Terminal;
