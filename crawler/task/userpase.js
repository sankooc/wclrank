// import $ from 'jquery';
import fs from 'node:fs';
import path from 'node:path';
// import $ from 'zepto';
import cheerio from 'cheerio';

const parse = async (cd, zone, username) => {
    const fpath = path.join('./', './build/'+cd+'/html/user-'+encodeURIComponent(username)+'.html');
    // console.log(fpath);
    if(!fs.existsSync(fpath)){
        return;
    }
    const html = fs.readFileSync(fpath).toString();
    const $ = cheerio.load(html);
    const el = $('.stats>.best-perf-avg>b').text().trim();
    const avg = parseInt(el);
    const item = {};
    item.avg = avg;
    item.details = [];
    const tableSelect = `table#boss-table-${zone}`;
    const list = $(tableSelect + '>tbody>tr');
    for(const tr of list){
        const val = $(tr).find('td.rank-percent')[0].childNodes[0].nodeValue.trim();
        // console.log(val)
        const bossId = $(tr).find('td img.boss-icon').attr('src')
        const m = bossId.match(/\/(\d+)-icon/);
        // console.log(m[1]);
        item.details.push({id: m[1], val})
    }
    return item;
};



export const build = async (rname, zone, cd) => {
    const mf = `./build/${cd}/data.json`;
    if(!fs.existsSync(mf)){
        return;
    }
    const metadata = JSON.parse(fs.readFileSync(mf));
    const saveMeta = (meta) => {
        fs.writeFileSync(mf, JSON.stringify(meta));
    }

    console.log(metadata);

    const {data} = metadata;
    for (const { name, rate } of data) {
        if(!rate){
            continue;
        }
        data.rate = await parse(cd, zone, name);
    }
};
// const rs = await parse('0718', '1025', '大尾巴黄鼠狼');

// console.log(rs);

// const cd = '0718';
// const zone = '1025'; // 不同阶段raid
// const rname = '碧玉矿洞';

// await build(rname, zone, cd);