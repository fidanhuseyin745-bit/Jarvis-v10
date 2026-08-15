'use strict';

class Generate{

constructor(ai){
this.ai=ai;
}

async run(prompt){

return await this.ai.generate(prompt);

}

}

module.exports=Generate;
