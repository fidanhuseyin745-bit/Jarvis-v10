'use strict';

module.exports={

read(file){

return JSON.parse(require('fs').readFileSync(file));

},

write(file,obj){

require('fs').writeFileSync(
file,
JSON.stringify(obj,null,2)
);

}

};
