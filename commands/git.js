'use strict';

const {execSync}=require('child_process');

class Git{

constructor(projects){

this.projects=projects;

}

init(){

execSync('git init',{

cwd:this.projects.getCurrent(),
stdio:'inherit'

});

console.log('✅ Git hazır');

}

}

module.exports=Git;
