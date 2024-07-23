import fs from 'node:fs';
import moment from 'moment';
import cheerio from 'cheerio';
import { RACS,log } from './constans.js';


const inspect = (ff) => {
    const $ = cheerio.load(fs.readFileSync(ff).toString());
    const items = $('table.ranking-table tbody tr');
    const rs = [];
    for (const item of items) {
        const r = {};
        r.rank = parseInt($(item).find('td.rank').text().trim());
        r.name = $(item).find('td .players-table-name a.main-table-player').text().trim();
        r.clz = $(item).find('td .players-table-name img').attr('alt').trim();
        r.dps = $(item).find('td.players-table-dps').text().trim();
        r.ts = 'N/A';
        const ts = $(item).find('td.players-table-date span').text().trim();
        if (ts) {
            const m = ts.match(/^(\d+)\$/);
            if (m && m.length > 1) {
                r.ts = moment(parseInt(m[1])).format("MM/DD")
            }
        }
        rs.push(r);
    }
    return rs;
}

const readOverview = (colddown) => {
    const { cd } = colddown;
    let page = 1;
    const items = [];
    while (true) {
        const ff = colddown.overview(page);
        if (!fs.existsSync(ff)) {
            break;
        }
        items.push(...inspect(ff))
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
        items.push(...inspect(ff))
        page += 1;
    }
    return items;
};

const parse = (colddown, username) => {
    const { cd, info } = colddown;
    const { region, zone, faction } = info;
    const fpath = colddown.userFile(username);
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
        const bossId = $(tr).find('td img.boss-icon').attr('src')
        const m = bossId.match(/\/(\d+)-icon/);
        item.details.push({id: m[1], val})
    }
    return item;
};


export const build = (colddown) => {
    const { cd, info } = colddown;
    const { region, zone, faction } = info;
    const rs = {
        cd,
        region,
        zone,
        faction,
        ts: Date.now(),
        items: [],
    };
    const userMap = {};
    const getUser = (name, ts) => {
        if (userMap[name]) return userMap[name];
        userMap[name] = {
            ts,
            subs: [],
        }
        return userMap[name];
    }

    let items = readOverview(colddown);

    for (const item of items) {
        const { rank, name, ts, dps, clz } = item;
        const userInfo = getUser(name, ts);
        userInfo.overview = { rank, clz, dps };
    }
    log('overvie-complete');
    for (const k of Object.keys(RACS)) {
        const sps = RACS[k];
        for (const spec of sps) {
            let items = readRaces(colddown, k, spec);
            for (const item of items) {
                const { rank, name, ts, dps, clz } = item;
                const userInfo = getUser(name, ts);
                userInfo.subs.push({
                    clz,
                    rank,
                    dps
                })
            }
        }
    }
    log('race-complete');
    const uerRankedCount = Object.keys(userMap).length;
    log('user ranked count', uerRankedCount);
    let infoCount = 0;
    for(const username of Object.keys(userMap)){
        const userInfo = userMap[username];
        userInfo.name = username;
        const info = parse(colddown, username);
        userInfo.score = 0;
        if(info){
            infoCount += 1;
            userInfo.score = info.avg
        }
        rs.items.push(userInfo)
    }
    log('user ranked count', infoCount);
    log('user mapping complete');
    fs.writeFileSync(`./build/${cd}/data.json`, JSON.stringify(rs));

    return {uerRankedCount, infoCount};
};