"use strict";

class FusionEngine{

    fuse(report){

        if(!report || !report.best)
            return report;

        const merged=[];

        const seen=new Set();

        for(const item of report.best){

            let text=item.text
                .replace(/\s+/g," ")
                .trim();

            const key=text
                .toLowerCase()
                .replace(/[^\p{L}\p{N}\s]/gu,"")
                .split(/\s+/)
                .slice(0,6)
                .join(" ");

            if(seen.has(key))
                continue;

            seen.add(key);

            merged.push({
                ...item,
                text
            });

        }

        return{

            ...report,

            best:merged

        };

    }

}

module.exports=new FusionEngine();
