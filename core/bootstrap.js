'use strict';

const ModuleManager=require('./moduleManager');
const Router=require('./router');

class Bootstrap{

create(){

return{

modules:new ModuleManager(),

router:new Router()

};

}

}

module.exports=Bootstrap;
