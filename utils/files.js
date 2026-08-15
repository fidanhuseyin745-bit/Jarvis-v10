'use strict';

const fs=require('fs');

module.exports={

exists(path){

return fs.existsSync(path);

},

read(path){

return fs.readFileSync(path,'utf8');

},

write(path,data){

fs.writeFileSync(path,data);

}

};
