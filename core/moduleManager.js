'use strict';

class ModuleManager{

constructor(){

this.modules=new Map();

}

register(name,module){

this.modules.set(name,module);

}

get(name){

return this.modules.get(name);

}

}

module.exports=ModuleManager;
