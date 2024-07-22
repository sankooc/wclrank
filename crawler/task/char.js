
import fs from 'node:fs';
import puppeteer from 'puppeteer';
import moment from 'moment';
import cheerio from 'cheerio';

const time = async (ts) => {
    return new Promise((resolv) => {
        setTimeout(resolv, ts);
    })
};
const now = () => {
    return moment().format('DD HH:mm:ss')
}
export const build = async (region_cn, zone, cd) => {
    const data = JSON.parse(fs.readFileSync(`./build/${cd}/data.json`));


    const browser = await puppeteer.launch({
        // args: ['--proxy-server=127.0.0.1:7890']
    });

    const update = async (region, name, zone, size, cd) => {
        const fname = './build/' + cd + '/html/user-' + encodeURIComponent(name) + '.html';
        if (fs.existsSync(fname)) {
            return;
        }
        console.log('read', name)
        const url = `https://classic.warcraftlogs.com/character/cn/${encodeURIComponent(region)}/${encodeURIComponent(name)}#zone=${zone}&size=${size}`;
        console.log(now(), ' open:', url);
        const page = await browser.newPage();
        const readText = async (selector) => {
            const tr = await page.$(selector)
            const value = await page.evaluate(el => el.textContent, tr);
            return value ? value.trim() : '';
        }
        let it;
        let count = 0;
        try {
            await page.goto(url);
            await page.setViewport({ width: 1280, height: 1024 });
            const content2 = await page.content();
            fs.writeFileSync('./prog/cache.html', content2)
            // it = setInterval(() => {
            //     count += 1;
            //     page.content().then((cont) => {
            //         // console.log(cont);
            //         fs.writeFileSync(`./prog/cache_${count}.html`, cont)
            //     });
            // }, 3000)
            await page.waitForSelector('.stats .best-perf-avg');
            // clearInterval(it)
            const content = await page.content();
            fs.writeFileSync(fname, content)
        } catch (e) {
            console.error(e);
            await page.screenshot({
                path: 'hn.png',
            });
            // try {
            //     const ff = './prog/fail.html';
            //     if(fs.existsSync(ff)){
            //         fs.rmSync(ff);
            //     }
            //     page.content().then((_content) => {
            //         fs.writeFileSync(ff, _content)
            //     });
            // } catch (e) {
            //     console.error(e);
            // }
            //   clearInterval(it)
        }
        page.close();
        await time(1500);
    };
    for (const item of data.items) {
        const { name } = item;
        await update(region_cn, name, zone, 25, cd);
    }
    await browser.close();

};



const cd = '0718';
const zone = '1025';
await build('碧玉矿洞', zone, cd);