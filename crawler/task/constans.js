import moment from 'moment';
import cheerio from 'cheerio';
import fs from 'node:fs';





const _mkdir = (ff) => {
    if(fs.existsSync(ff)) {
        return false
    }
    fs.mkdirSync(ff);
    return true;

}
export class ColdDown {
    constructor(cd, info){
        this.base = './build/';
        this.cd = cd;
        this.info = info;
    }
    get root (){
        return `${this.base}${this.cd}/${this.info.region}-${this.info.zone}-${this.info.faction}`
    }
    init(){
        _mkdir(this.base + this.cd)
        _mkdir(`${this.root}`)
        _mkdir(`${this.root}/html`)
    }
    overview(page){
        return `${this.root}/html/overview-${page}.html`;
    }
    overviewPage(page){
        return `https://classic.warcraftlogs.com/server/rankings/${this.info.region}/${this.info.zone}#faction=${this.info.faction}&page=${page}`;
    }
    spec(clz, spec, page){
         return `${this.root}/html/stat-${clz}-${spec}-${page}.html`;
    }
    specPage(clz, spec, page){
        return `https://classic.warcraftlogs.com/server/rankings/${this.info.region}/${this.info.zone}#class=${clz}&spec=${spec}&faction=${this.info.faction}&page=${page}`;
    }
}

export const now = () => {
    return moment().format('HH:mm:ss')
}

export const sleep = async (ts) => {
    return new Promise((resolv) => {
        setTimeout(resolv, ts);
    })
};

export const REGION = {
    5042: '碧玉矿洞',
}

export const ZONE = {
    1025: 'NAXX',
}

export const RACS = {
    Shaman: ['Enhancement', 'Elemental'],
    DeathKnight: ['Blood', 'Frost', 'Unholy'],
    Druid: ['Balance', 'Feral'],
    Hunter: ['BeastMastery', 'Survival', 'Marksmanship'],
    Mage: ['Arcane', 'Fire', 'Frost'],
    Paladin: ['Retribution'],
    Priest: ['Shadow'],
    Rogue: ['Assassination', 'Combat'],
    Warlock: ['Affliction', 'Demonology', 'Destruction'],
    Warrior: ['Arms', 'Fury'],
};

export const log = (...arg) => {
    console.log(moment().format('HH:mm:ss'), ...arg);
}