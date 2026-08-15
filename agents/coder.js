'use strict';

const fs=require('fs');
const path=require('path');

class Coder{

async generate(prompt){

return{
success:true,
type:'generate',
prompt
};

}

async analyze(project){

const files=fs.readdirSync(project);

return{
success:true,
files
};

}

async fix(project){

return{
success:true,
message:'AutoFix hazır.'
};

}

}

module.exports=Coder;
