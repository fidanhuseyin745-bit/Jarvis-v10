'use strict';

const fs=require('fs');

class Writer{

write(file,code){

fs.writeFileSync(file,code);

console.log('✍️',file);

}

}

module.exports=Writer;
