import puppeteer from 'puppeteer';
import fs from 'node:fs';
import cheerio from 'cheerio';
import {now, sleep, RACS, log} from './constans.js';

export const build = async (colddown) => {
    const { cd, info} = colddown;
    const { region, zone,faction } = info;
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
        await page.setViewport({ width: 800, height: 600 });
        await page.waitForSelector('table .players-table-name');
        const html = await page.content();
        page.close();
        return {
            content: html,
            next: hasNext(html),
        };
    };

    {
        let pageNum = 1;
        while(true){
            if(pageNum > 20){
                break;
            }
            const ff = colddown.overview(pageNum);
            log(fs.existsSync(ff));
            if(fs.existsSync(ff)){
                const next = hasNext(fs.readFileSync(ff).toString());
                if(!next){
                    break;
                }
            } else {
                const url = colddown.overviewPage(pageNum);
                const cont = await marking(url);
                fs.writeFileSync(ff, cont.content);
                await sleep(2000)
                if(!cont.next){
                    break;
                }
            }
            pageNum += 1;    
        }
    }
    for(const k of Object.keys(RACS)){
        const sps = RACS[k];
        for(const spec of sps){
            let pageNum = 1;
            while(true) {
                const ff = colddown.spec(k, spec, pageNum);
                if(fs.existsSync(ff)){
                    const next = hasNext(fs.readFileSync(ff).toString());
                    if(!next){
                        break;
                    }
                } else {
                    const url = colddown.specPage(k, spec, pageNum);
                    const cont = await marking(url);
                    fs.writeFileSync(ff, cont.content);
                    await sleep(3000)
                    if(!cont.next){
                        break;
                    }
                }
                pageNum += 1;
            }
        }
    }
    await browser.close();
}

// await build(colddown);