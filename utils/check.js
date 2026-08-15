'use strict';

const fs=require('fs');

module.exports={

exists(file){

return fs.existsSync(file);

}

};
