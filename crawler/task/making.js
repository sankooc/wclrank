// import $ from 'jquery';
import fs from 'node:fs';
import path from 'node:path';

const cd = '0718';
const region = '5042';
const zone = '1025';
const faction = '1';
const rname = '碧玉矿洞';

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


// let inx = 0;
// for(const item of data.items){
//     const {subs} = item;
//     if(subs.length > 1){
//         console.log(inx)
//     }
//     inx += 1;
// } /// 小鼠加入的队伍。 CHAT_MSG_SYSTEM
// console.log(compress(data.items[603]));
// console.log(data.items[3736]);
// console.log(compress(data.items[3736]));
const incontent = data.items.map((item) => {
    const { name } = item;
    return `["${name}"] = "${compress(item)}"`;
}).join(',')

const content = `wclData={${incontent}}`;



fs.writeFileSync(`./build/${cd}/_data.lua`, content)