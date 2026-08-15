'use strict';

const templates=require('../templates');

class TemplateAgent{

find(prompt){

prompt=prompt.toLowerCase();

if(prompt.includes('express'))

return templates.express();

if(prompt.includes('react'))

return templates.react();

return null;

}

}

module.exports=TemplateAgent;
