'use strict';

class Session{

constructor(){

this.project=null;

}

setProject(path){

this.project=path;

}

getProject(){

return this.project;

}

clear(){

this.project=null;

}

}

module.exports=new Session();
