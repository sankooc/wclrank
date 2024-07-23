import fs from 'node:fs';
import {REGION, ZONE, FAC, log} from './constans.js';
import { spawn,exec } from 'node:child_process';

export const build = (colddown) => {
    const { cd, info } = colddown;
    const { region, zone, faction } = info;
    const compress = (item) => {
        const { ts, subs, overview,score, name } = item;
        let str = `${ts}@${score}@`;
        if(overview){
            str += `${overview.rank}|${overview.clz}|${overview.dps}`
        }
        str += '@';
        if(subs && subs.length){
            str += subs.map((sub) => {
                const {clz, rank, dps} = sub;
                return `${rank}|${clz}|${dps}`;
            }).join('#');
            // #
        }
        return str;
    }
    
    const data = JSON.parse(fs.readFileSync(`./build/${cd}/data.json`));
    
    let user = 0;
    let scored = 0;
    const incontent = data.items.map((item) => {
        const { name, score } = item;
        user+=1;
        if(score) scored += 1;
        return `["${name}"] = "${compress(item)}"`;
    }).join(',')
    const regoion_cn = REGION[region];
    const zone_cn = ZONE[zone];
    const part = FAC[faction];
    const content = `reportCD="${cd}"\r\nwclRegion="${REGION[region]}"\r\nwclData={${incontent}}`;
    fs.writeFileSync(`./build/${cd}/_data.lua`, content);
    // fs.writeFileSync(`../release/${regoion_cn}-${zone_cn}-${part}-data.lua`, content);
    const df = '../WclInspector/datas.lua';
    if(fs.existsSync(df)){
        fs.rmSync(df);
    }
    fs.writeFileSync(df, content);
    exec(`zip -r ../release/WclInspector-${regoion_cn}-${zone_cn}-${part}[${scored}-${user}].zip ../WclInspector/`, (err, stdout, stderr) => {
        log(stdout);
        console.error(stderr);
    })
};