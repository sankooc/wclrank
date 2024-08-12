import puppeteer from 'puppeteer';
import fs from 'node:fs';
import cheerio from 'cheerio';
import moment from 'moment';
import { skipTalent, sleep, COMPS, log } from './constans.js';



const existsFileSync = (ff, stamp) => {
    if (fs.existsSync(ff)) {
        const { ctimeMs } = fs.statSync(ff);
        const cur = moment(ctimeMs).format('MM-DD');
        if (stamp == cur) {
            return true;
        } else {
            fs.rmSync(ff);
        }
    }
    return false;
}
export const build = async (colddown, stamp) => {
    const { info } = colddown;
    const stampPath = colddown.stamp();
    if (fs.existsSync(stampPath)) {
        const ss = fs.readFileSync(stampPath).toString();
        if (ss == stamp) {
            return;
        }
    }
    const browser = await puppeteer.launch();

    const hasNext = (html) => {
        const $ = cheerio.load(html);
        const at = $($('ul.pagination>li')[1]).find('a');
        return !!at.length;
    };
    const marking = async (url) => {
        log('open', url);
        const page = await browser.newPage();
        await page.goto(url);
        try {
            await page.setViewport({ width: 800, height: 600 });
            await page.waitForSelector('table .players-table-name');
            const html = await page.content();
            await page.close();
            return {
                content: html,
                next: hasNext(html),
                save: true,
            };
        } catch (e) {
            console.error(e);
        }
        await page.close();
        return { save: false };
    };

    {
        let pageNum = 1;
        while (true) {
            if (pageNum > 50) {
                break;
            }
            const ff = colddown.overview(pageNum);
            if (existsFileSync(ff, stamp)) {

                log(`overview ${pageNum} page exist`);
                const next = hasNext(fs.readFileSync(ff).toString());
                if (!next) {
                    break;
                }
            } else {
                const url = colddown.overviewPage(pageNum);
                const cont = await marking(url);
                if (cont.save) {
                    fs.writeFileSync(ff, cont.content);
                    await sleep(1000)
                } else {
                    break;
                }
                if (!cont.next) {
                    break;
                }
            }
            pageNum += 1;
        }
    }
    for (const cp of Object.keys(COMPS)) {
        const [k, spec] = cp.split('-');
        if (skipTalent(k, spec)) {
            continue;
        }
        // if (k == 'DeathKnight') {
        //     switch (spec) {
        //         case "Lichborne":
        //         case "Runeblade":
        //         continue;
        //     }
        // }
        // if (k == 'Druid') {
        //     switch (spec) {
        //         case "Warden":
        //         continue;
        //     }
        // }
        // if (k == 'Warrior') {
        //     switch (spec) {
        //         case "Protection":
        //         case "Gladiator":
        //         case "Champion":
        //         case "Melee":
        //         continue;
        //     }
        // }
        let pageNum = 1;
        while (true) {
            const ff = colddown.spec(k, spec, pageNum);
            if (existsFileSync(ff, stamp)) {
                log(`spec ${k}-${spec}-${pageNum} page exist`);
                const next = hasNext(fs.readFileSync(ff).toString());
                if (!next) {
                    break;
                }
            } else {
                const url = colddown.specPage(k, spec, pageNum);
                const cont = await marking(url);
                if (cont.save) {
                    fs.writeFileSync(ff, cont.content);
                    await sleep(3000)
                } else {
                    break;
                }
                if (!cont.next) {
                    break;
                }
            }
            pageNum += 1;
        }
    }
    await browser.close();
    console.log('rank-complete');
    fs.writeFileSync(stampPath, stamp);
}