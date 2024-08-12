import puppeteer from 'puppeteer';
import fs from 'node:fs';
import moment from 'moment';
import cheerio from 'cheerio';
import { skipTalent, COMPS, log, sleep } from './constans.js';
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
        r._ts = parseInt(m[1]);
        r.ts = moment(parseInt(m[1])).format("MM/DD")
      }
    }
    rs.push(r);
  }
  console.log(rs);
  process.exit(1)
  return rs;
}

const inspect2 = (ff) => {
  const $ = cheerio.load(fs.readFileSync(ff).toString());
  const {ctimeMs} = fs.statSync(ff);
  const items = $('table.summary-table tbody tr');
  const rs = [];
  for (const item of items) {
    const r = {};
    r.rank = parseInt($(item).find('td.rank').text().trim());
    r.name = $(item).find('td .players-table-name a.main-table-player').text().trim();
    r.clz = $(item).find('td .players-table-name img').attr('alt').trim();
    r.score = $(item).find('td.players-table-score').text().trim();
    r.ts = ctimeMs
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
    items.push(...inspect2(ff))
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
    items.push(...inspect2(ff))
    page += 1;
  }
  return items;
};

const download = async (browser, colddown,prefix, username, score) => {
  const fpath = colddown.userFile(username,score);
  if (fs.existsSync(fpath)) {
    return true;
  }
  await sleep(5000);
  const url = colddown.userPage(username);
  // const url = `https://classic.warcraftlogs.com/character/cn/${encodeURIComponent(region)}/${encodeURIComponent(name)}#zone=${zone}&size=${size}`;
  log(prefix+' open:', url);
  // log(fpath);
  const page = await browser.newPage();
  try {
    await page.goto(url);
  }catch(e){
    console.error(e);
    return false;
  }
  try {
    await page.waitForSelector('.stats .best-perf-avg');
    const content = await page.content();
    fs.writeFileSync(fpath, content)
  }catch(e){
    console.error(e);
    return false;
  }
  await page.close();
  return true;
};


export const build = async (colddown) => {
  const { info } = colddown;
  const userMap = {};
  const getUser = (name, score) => {
    if (userMap[name]) return userMap[name];
    userMap[name] = {
      score
    }
    return userMap[name];
  }
  log('start load overview')
  let items = readOverview(colddown);

  for (const item of items) {
    const { rank, name, clz, score } = item;
    getUser(name, score);
  }
  log('load overvie complete');
  for(const cp of Object.keys(COMPS)){
    const [k, spec] = cp.split('-');
    if(skipTalent(k, spec)) {
        continue;
    }
    let items = readRaces(colddown, k, spec);
    for (const item of items) {
      const { rank, name, clz, score } = item;
      getUser(name, score);
    }

  }
  log('load race complete');
  const total = Object.keys(userMap).length;
  log('user count', total);
  const browser = await puppeteer.launch();
  let infos = 0;
  let index = 0;
  for (const username of Object.keys(userMap)) {
    try {
      const prefix = (index++) + '/' + total;
      const flag = await download(browser, colddown, prefix, username, userMap[username].score);
      if(flag) infos +=1;
    } catch (e) {
      console.error(e);
    }
  }
  log('user exists', total);
  await browser.close();
  return {total, infos}
};