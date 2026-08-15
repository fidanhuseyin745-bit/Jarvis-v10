'use strict';

const fs=require('fs');

module.exports=function(file){

fs.writeFileSync(file,'');

console.log(file,'oluşturuldu');

}
