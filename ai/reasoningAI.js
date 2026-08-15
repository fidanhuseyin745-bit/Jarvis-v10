"use strict";

const axios=require("axios");
const config=require("../config/config");

class ReasoningAI{

    async generate(question,report){

        if(!report || !report.best || report.best.length===0)
            return null;

        let facts="";

        report.best.forEach((x,i)=>{
            facts+=(i+1)+". "+x.text+"\n";
        });

        const prompt=`
Soru:
${question}

Bilgiler:
${facts}

Yalnızca bu bilgileri kullanarak kısa ve doğal bir cevap yaz.
`;

        try{

            const res=await axios.post(
                config.aiUrl,
                {
                    model:config.model,
                    messages:[
                        {
                            role:"user",
                            content:prompt
                        }
                    ]
                },
                {
                    timeout:30000
                }
            );

            console.log(res.data);

            return res.data.choices[0].message.content;

        }catch(err){

            console.log("AI ERROR:");
            console.log(err.response?.data || err.message);

            return null;

        }

    }

}

module.exports=new ReasoningAI();
