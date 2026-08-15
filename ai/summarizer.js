"use strict";

class Summarizer{

    summarize(question,report){

        if(!report || !report.best || report.best.length===0){
            return "Bu konu hakkında yeterli güvenilir bilgi bulamadım.";
        }

        let out="🤖 Jarvis\n\n";
        out+="📌 "+question+"\n\n";

        out+="Öne çıkan bilgiler:\n\n";

        report.best.forEach((item,i)=>{

            let text=item.text
                .replace(/Bu yazıda/gi,"")
                .replace(/Bu sayfada/gi,"")
                .replace(/tıklayın/gi,"")
                .replace(/yer almaktadır/gi,"")
                .replace(/\s+/g," ")
                .trim();

            if(text.length>180)
                text=text.substring(0,180)+"...";

            out+=(i+1)+". "+text+"\n\n";

        });

        out+="🧠 Genel değerlendirme:\n";

        if(report.average>=85){

            out+="Kaynaklar büyük ölçüde aynı bilgileri doğruluyor. Sonuç güvenilir görünüyor.";

        }else if(report.average>=70){

            out+="Kaynaklar genel olarak birbiriyle uyumlu. Yine de yeni gelişmeler olabileceği için doğrulama faydalı olabilir.";

        }else{

            out+="Kaynaklar arasında farklılıklar bulunabilir. Bilgileri dikkatli değerlendirmek faydalı olacaktır.";

        }

        return out;

    }

}

module.exports=new Summarizer();
