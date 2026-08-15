"use strict";

class FormatterService{

    format(question,list){

        let out="🤖 Jarvis\n\n";

        out+="📌 "+question+"\n\n";

        if(list.length===0)
            return out+"Bu konuda yeterli güvenilir bilgi bulamadım.";

        if(list.length===1){

            out+=list[0]+"\n\n";

        }else{

            out+="Araştırdım ve özetledim:\n\n";

            list.forEach((t,i)=>{

                out+=(i+1)+". "+t+"\n\n";

            });

        }

        out+="📝 Sonuç:\n";

        out+="Farklı kaynaklar karşılaştırılarak en önemli bilgiler özetlenmiştir.";

        return out;

    }

}

module.exports=new FormatterService();
