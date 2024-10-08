import fs from 'node:fs';
import { REGION, ZONE, FAC, log } from './constans.js';
import { exec } from 'node:child_process';
import moment from 'moment';

export const build = (colddown) => {
    const { info } = colddown;
    const { region, zone, faction } = info;
    const compress = (item) => {
        const { subs, overview, avg, ts } = item;
        // const { ts, subs, overview, score, name } = item;
        let time = '';
        if(ts){
            time = moment(ts).format('MM/DD')
        }
        let str = `${time}@${avg}@`;
        if (overview) {
            str += `${overview.rank}|${overview.clz}|${overview.score}`
        }
        str += '@';
        if (subs && subs.length) {
            str += subs.map((sub) => {
                const { clz, rank, score } = sub;
                return `${rank}|${clz}|${score}`;
            }).join('#');
            // #
        }
        return str;
    }

    const data = JSON.parse(fs.readFileSync(colddown.dataSource));

    let user = 0;
    let scored = 0;
    const incontent = data.items.map((item) => {
        const { name, score, subs, overview,avg,ts } = item;
        user += 1;
        if (avg) scored += 1;
        return `["${name}"] = "${compress(item)}"`;
    }).join(',')
    const regoion_cn = REGION[region];
    const zone_cn = ZONE[zone];
    const part = FAC[faction];
    const content = `
    wclRegion="${REGION[region]}"
    if GetRealmName() ~= wclRegion then
        return
    end
    wclData={${incontent}}`;
    const df = `../WclInspector/realm/${region}.lua`;
    if (fs.existsSync(df)) {
        fs.rmSync(df);
    }
    console.log(scored);
    // console.log(content);
    fs.writeFileSync(df, content);
    exec(`zip -r ../release/WclInspector-${regoion_cn}-${zone_cn}-${part}[${scored}-${user}].zip ../WclInspector/`, (err, stdout, stderr) => {
        log(stdout);
        console.error(stderr);
    })
};