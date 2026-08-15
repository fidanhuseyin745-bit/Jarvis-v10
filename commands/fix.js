'use strict';

class Fix{

constructor(ai){
this.ai=ai;
}

async run(project){

return await this.ai.fix(project);

}

}

module.exports=Fix;
