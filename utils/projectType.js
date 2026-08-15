'use strict';

const fs=require('fs');
const path=require('path');

module.exports=function(dir){

if(fs.existsSync(path.join(dir,'vite.config.js')))
return 'react';

if(fs.existsSync(path.join(dir,'app.py')))
return 'flask';

if(fs.existsSync(path.join(dir,'main.py')))
return 'fastapi';

if(fs.existsSync(path.join(dir,'package.json')))
return 'node';

return 'unknown';

}
