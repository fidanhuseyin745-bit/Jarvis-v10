'use strict';

class Analyze{

constructor(ai){
this.ai=ai;
}

async run(project){

return await this.ai.analyze(project);

}

}

module.exports=Analyze;
