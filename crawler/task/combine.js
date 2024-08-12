import fs from 'node:fs';
import moment from 'moment';
import cheerio from 'cheerio';
import { COMPS,log } from './constans.js';

const inspect2 = (ff) => {
    const $ = cheerio.load(fs.readFileSync(ff).toString());
    const items = $('table.summary-table tbody tr');
    const rs = [];
    for (const item of items) {
      const r = {};
      r.rank = parseInt($(item).find('td.rank').text().trim());
      r.name = $(item).find('td .players-table-name a.main-table-player').text().trim();
      r.clz = $(item).find('td .players-table-name img').attr('alt').trim();
      r.score = $(item).find('td.players-table-score').text().trim();
      rs.push(r);
    }
    return rs;
  }

const readOverview = (colddown) => {
    let page = 1;
    const items = [];
    while (true) {
        const ff = colddown.overview(page);
        if (!fs.existsSync(ff)) {
            break;
        }
        items.push(...inspect2(ff))
        page += 1;
    }
    return items;
}

const readRaces = (colddown, clz, spec) => {
    let page = 1
    const items = [];
    while (true) {
        const ff = colddown.spec(clz, spec, page);
        if (!fs.existsSync(ff)) {
            break;
        }
        items.push(...inspect2(ff))
        page += 1;
    }
    return items;
};

const parse = (colddown, username, score) => {
    const { info } = colddown;
    const { zone } = info;
    const fpath = colddown.userFileOne(username, score);
    if(!fpath){
        return
    }
    if(!fs.existsSync(fpath)){
        console.log('not exist', username, score);
        console.log(fpath);
        return;
    }
    const html = fs.readFileSync(fpath).toString();
    const {ctimeMs} = fs.statSync(fpath);
    const $ = cheerio.load(html);
    const el = $('.stats>.best-perf-avg>b').text().trim();
    const avg = parseInt(el);
    const item = {};
    item.avg = avg;
    item.ts = ctimeMs;
    // item.details = [];
    // const tableSelect = `table#boss-table-${zone}`;
    // const list = $(tableSelect + '>tbody>tr');
    // for(const tr of list){
    //     const val = $(tr).find('td.rank-percent')[0].childNodes[0].nodeValue.trim();
    //     const bossId = $(tr).find('td img.boss-icon').attr('src')
    //     const m = bossId.match(/\/(\d+)-icon/);
    //     item.details.push({id: m[1], val})
    // }
    return item;
};
// 60 * 60 * 24

export const build = (colddown) => {
    const { info } = colddown;
    const { region, zone, faction } = info;
    const rs = {
        region,
        zone,
        faction,
        // ts: Date.now(),
        items: [],
    };
    const userMap = {};
    const getUser = (name, score) => {
        if (userMap[name]) return userMap[name];
        userMap[name] = {
            score,
            subs: [],
        }
        return userMap[name];
    }

    let items = readOverview(colddown);

    for (const item of items) {
        const { rank, name, clz, score } = item;
        const userInfo = getUser(name, score);
        userInfo.overview = { rank, clz: COMPS[clz], score };
    }
    log('overvie-complete');
    for(const cp of Object.keys(COMPS)){
        const [k, spec] = cp.split('-')
        
        let items = readRaces(colddown, k, spec);
        for (const item of items) {
            const { rank, name, clz, score} = item;
            const userInfo = getUser(name, 0);
            userInfo.subs.push({
                clz: COMPS[clz],
                rank,
                score
            })
        }
    }
    log('race-complete');
    const uerRankedCount = Object.keys(userMap).length;
    log('user ranked count', uerRankedCount);
    let infoCount = 0;
    let count = 1;
    for(const username of Object.keys(userMap)){
        const userInfo = userMap[username];
        userInfo.name = username;
        const info = parse(colddown, username, userInfo.score);
        userInfo.avg = 0;
        if(info){
            infoCount += 1;
            userInfo.avg = info.avg
            userInfo.ts = info.ts;
        }
        rs.items.push(userInfo)
        if(count % 300 === 0){
            log(`combine: [${count}/${uerRankedCount}] infos:${infoCount}`);
        }
        count += 1;
    }
    log('user ranked count', infoCount);
    log('user mapping complete');
    fs.writeFileSync(colddown.dataSource, JSON.stringify(rs));

    return {uerRankedCount, infoCount};
};