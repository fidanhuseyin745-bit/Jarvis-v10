"use strict";

class MergerService{

    similarity(a,b){

        a=String(a).toLowerCase();
        b=String(b).toLowerCase();

        const wa=new Set(a.split(/\s+/));
        const wb=new Set(b.split(/\s+/));

        let common=0;

        for(const w of wa){

            if(wb.has(w))
                common++;

        }

        return common/Math.max(wa.size,1);

    }

    merge(list){

        const out=[];

        for(const text of list){

            let found=false;

            for(const item of out){

                if(this.similarity(text,item)>0.65){

                    found=true;
                    break;

                }

            }

            if(!found)
                out.push(text);

        }

        return out;

    }

}

module.exports=new MergerService();
