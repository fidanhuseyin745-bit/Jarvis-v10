"use strict";

class Fixer{

  async fix(ai,issue,code){

    const prompt=`
Aşağıdaki kodda belirtilen problemi düzelt.

Problem:
${issue}

Kod:
${code}

Sadece düzeltilmiş kodu döndür.
`;

    return await ai.chat([
      {role:"system",content:"Kıdemli JavaScript geliştiricisisin."},
      {role:"user",content:prompt}
    ],{
      max_tokens:600,
      temperature:0.1
    });

  }

}

module.exports=Fixer;
