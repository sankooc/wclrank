import puppeteer from 'puppeteer';
import fs from 'node:fs';
// Or import puppeteer from 'puppeteer-core';


//https://classic.warcraftlogs.com/character/cn/%E7%A2%A7%E7%8E%89%E7%9F%BF%E6%B4%9E/%E5%A4%A7%E5%B0%BE%E5%B7%B4%E9%BB%84%E9%BC%A0%E7%8B%BC#zone=1025
// console.log(ranking);



// const browser = await puppeteer.launch();
// console.log('## browser up');


const time = async (ts) => {
    return new Promise((resolv) => {
        setTimeout(resolv, ts);
    })
};
export const build = async (region, zone, faction, start, maxPage, rname) => {

    const browser = await puppeteer.launch();
    const marking = async (region, zone, faction, pageNum) => {
        const ranking = `https://classic.warcraftlogs.com/server/rankings/${region}/${zone}#faction=${faction}&page=${pageNum}`;
        console.log('start inspect', ranking);
        // const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const readText = async (element, selector) => {
            const tr = await element.$(selector)
            const value = await page.evaluate(el => el.textContent, tr);
            return value ? value.trim() : '';
        }
        const readAttr = async (element, selector, name) => {
            const tr = await element.$(selector);
            const attr = await page.evaluate(el => el.getAttribute('alt'), tr);
            return attr ? attr.trim() : '';
        }
        await page.goto(ranking);
        await page.setViewport({ width: 1080, height: 1024 });
        await page.waitForSelector('table .players-table-name');
        // await page.screenshot({
        //   path: 'page.png',
        // });
        const rs = [];
        try {
            const table = await page.$('table.ranking-table')
            const trs = await table.$$('tbody tr');
            console.log('item count' + trs.length);
            for (const element of trs) {
                try {
                    const item = {};
                    item.rank = await readText(element, 'td.rank');
                    item.name = await readText(element, 'td .players-table-name a.main-table-player');
                    item.class = await readAttr(element, 'td .players-table-name img', 'alt');
                    item.itemLevel = await readText(element, 'td.ilvl-cell');
                    item.dps = await readText(element, 'td.players-table-dps');
                    const ts = await readText(element, 'td.players-table-date span');
                    if (ts) {
                        const m = ts.match(/^(\d+)\$/);
                        if (m && m.length > 1) {
                            item.ts = m[1]
                        }
                    }
                    rs.push(item);
                    // console.log(rank, name, itemLevel, dps, ts);
                } catch (e) {
                    console.error(e);
                }
            }
        } catch (e) {
            console.error(e)
        }
        page.close();
        return rs;
    };
    const rs = [];
    for (let i = start; i < maxPage; i += 1) {
        const items = await marking(region, zone, faction, i);
        rs.push(...items);
        fs.writeFileSync('./data.json', JSON.stringify({
            region,
            zone,
            faction,
            ts: Date.now(),
            name: rname,
            data: rs
        }));
        await time(10000);
    }

    await browser.close();
}