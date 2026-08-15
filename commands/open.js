'use strict';

class Open{

constructor(projects){
this.projects=projects;
}

run(){

console.log(this.projects.getCurrent());

}

}

module.exports=Open;
