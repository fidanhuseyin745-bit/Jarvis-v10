"use strict";

class DecisionEngine{

    decide(prompt){

        prompt=String(prompt||"").toLowerCase().trim();

        const score={
            memory:20,
            web:0,
            market:0,
            study:0,
            phone:0,
            coding:0,
            explain:0,
            compare:0,
            research:0
        };

        let intent="chat";

        const has=(...words)=>words.some(w=>prompt.includes(w));

        if(has("araştır","research","incele","analiz et")){
            score.research+=130;
            intent="research";
        }

        if(has("nedir","nasıl","neden","niye","kim","hangi","kaç","ne zaman","anlat","açıkla")){
            score.web+=70;
            score.explain+=80;
            intent="research";
        }

        if(has("bugün","güncel","son gelişme","haber")){
            score.web+=100;
            intent="news";
        }

        if(has("bitcoin","kripto","borsa","dolar","euro","altın","hisse")){
            score.market+=120;
            score.web+=40;
            intent="market";
        }

        if(has("yks","tyt","ayt","matematik","fizik","kimya","biyoloji","ders")){
            score.study+=120;
            intent="study";
        }

        if(has("telefon","android","youtube","uygulama","chrome")){
            score.phone+=120;
            intent="phone";
        }

        if(has("github","repo","repository","issue","pull request","pr ")){
            score.phone+=0;
            intent="coding";
            score.coding+=120;
        }

        if(has("kod yaz","kod oluştur","kod olustur","express","rest api","http server","html sayfa","cli araç","cli arac")){
            score.coding+=150;
            intent="coding";
        }

        if(has("modül ekle","modul ekle","yeni modül","modül sil","modul sil")){
            score.coding+=150;
            intent="coding";
        }

        if(has("terminal","komut çalıştır","komut calistir","kabuk","shell")){
            score.coding+=150;
            intent="coding";
        }

        if(has("node","javascript","python","kod","github","debug","hata")){
            score.coding+=120;
            intent="coding";
        }

        if(has("karşılaştır","vs","hangisi","farkı","mi","mı")){
            score.compare+=100;
        }

        if(has("benim","hatırlıyor musun","geçen","önceki")){
            score.memory+=100;
        }

        const plan=Object.entries(score)
            .sort((a,b)=>b[1]-a[1])
            .filter(x=>x[1]>0);

        return{
            intent,
            score,
            plan,
            confidence:plan.length ? plan[0][1] : 0
        };

    }

}

module.exports=new DecisionEngine();
