'use strict';

const {execSync}=require('child_process');

class Test{

run(project){

execSync('npm test',{
cwd:project,
stdio:'inherit'
});

}

}

module.exports=Test;
