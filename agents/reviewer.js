
"use strict";

class Reviewer{

  async review(ai,files){

    const prompt=`
Sen kıdemli bir yazılım mimarısın.

İncele:
${files.join("\n")}

Şunları değerlendir:
- Bug
- Güvenlik
- Performans
- Gereksiz kod
- Refactor önerisi

En fazla 6 madde yaz. 50-80 kelimeyi gecme.
`;

    return await ai.chat([
      {role:"system",content:"Kod inceleme uzmanısın."},
      {role:"user",content:prompt}
    ],{
      max_tokens:120,
      temperature:0.1
    });

  }

}

module.exports=Reviewer;
