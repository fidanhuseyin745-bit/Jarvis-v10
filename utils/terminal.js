'use strict';

const {execSync}=require('child_process');

class Terminal{

static run(cmd,cwd){

return execSync(cmd,{
cwd,
encoding:'utf8'
});

}

}

module.exports=Terminal;
