import puppeteer from 'puppeteer';
import fs from 'node:fs';
import moment from 'moment';
import cheerio from 'cheerio';
import { RACS, log, sleep } from './constans.js';
import path from 'node:path';


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
  const { cd } = colddown;
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

const download = async (browser, colddown, username) => {
  const { cd } = colddown;
  const fpath = colddown.userFile(username);
  if (fs.existsSync(fpath)) {
    return true;
  }
  await sleep(2000);
  const url = colddown.userPage(username);
  // const url = `https://classic.warcraftlogs.com/character/cn/${encodeURIComponent(region)}/${encodeURIComponent(name)}#zone=${zone}&size=${size}`;
  log(' open:', url);
  // log(fpath);
  const page = await browser.newPage();
  try {
    await page.goto(url);
  }catch(e){
    console.error(e);
    page.close();
    return false;
  }
  try {
    await page.waitForSelector('.stats .best-perf-avg');
    const content = await page.content();
    fs.writeFileSync(fpath, content)
  }catch(e){
    console.error(e);
    await page.screenshot({
      path: 'hn.png',
    });
    page.close();
    return false;
  }
  return true;
};


export const build = async (colddown) => {
  const { cd, info } = colddown;
  const { region, zone, faction } = info;
  const userMap = {};
  const getUser = (name, ts) => {
    if (userMap[name]) return userMap[name];
    userMap[name] = {
      ts,
      subs: [],
    }
    return userMap[name];
  }
  log('start load overview')
  let items = readOverview(colddown);

  for (const item of items) {
    const { rank, name, ts, dps, clz } = item;
    getUser(name, ts);
  }
  log('load overvie complete');
  for (const k of Object.keys(RACS)) {
    const sps = RACS[k];
    for (const spec of sps) {
      let items = readRaces(colddown, k, spec);
      for (const item of items) {
        const { rank, name, ts, dps, clz } = item;
        getUser(name, ts);
      }
    }
  }
  log('load race complete');
  const total = Object.keys(userMap).length;
  log('user count', total);

  const browser = await puppeteer.launch();
  let infos = 0;
  for (const username of Object.keys(userMap)) {
    try {
      const flag = await download(browser, colddown, username);
      if(flag) infos +=1;
    } catch (e) {
      console.error(e);
    }
  }
  await browser.close();
  return {total, infos}
};



// const cd = '0718';
// const region = '5042';
// const zone = '1025';
// const faction = '1';
// const rname = '碧玉矿洞';
// // log(readOverview(cd).length)
// // readRaces(cd, 'Priest', 'Shadow')
// build(cd, region, zone, faction);
// log(parse(cd, zone, '大尾巴黄鼠狼'));