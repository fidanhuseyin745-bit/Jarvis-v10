'use strict';

class Project{

constructor(projects){

this.projects=projects;

}

current(){

console.log(this.projects.getCurrent());

}

}

module.exports=Project;
