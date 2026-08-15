'use strict';

const context=require('./context');

module.exports={

save(data){

context.add(data);

},

list(){

return context.all();

},

clear(){

context.clear();

}

};
