import moment from 'moment';
import cheerio from 'cheerio';
import fs from 'node:fs';





const _mkdir = (ff) => {
    if (fs.existsSync(ff)) {
        return false
    }
    fs.mkdirSync(ff);
    return true;

}
export class ColdDown {
    constructor(info) {
        this.base = './build/';
        this.info = info;
    }
    get root() {
        return `${this.base}/${this.info.region}/${this.info.zone}-${this.info.faction}`
    }
    get userRoot() {
        return `${this.base}/users/${this.info.region}-${this.info.zone}`
    }
    init() {
        _mkdir(this.base)
        _mkdir(`${this.base}/${this.info.region}`)
        _mkdir(`${this.root}`)
        _mkdir(`${this.root}/html`)
    }
    overview(page) {
        return `${this.root}/html/overview-${page}.html`;
    }
    overviewPage(page) {
        return `https://classic.warcraftlogs.com/server/rankings/${this.info.region}/${this.info.zone}#faction=${this.info.faction}&boss=-1&partition=${this.info.partition}&page=${page}`;
    }
    spec(clz, spec, page) {
        return `${this.root}/html/stat-${clz}-${spec}-${page}.html`;
    }
    get dataSource() {
        return `${this.root}/data.json`
    }
    specPage(clz, spec, page) {
        return `https://classic.warcraftlogs.com/server/rankings/${this.info.region}/${this.info.zone}#class=${clz}&spec=${spec}&boss=-1&partition=${this.info.partition}&faction=${this.info.faction}&page=${page}`;
    }
    userFile(username, score) {
        const sup = this.root + '/users/' + encodeURIComponent(username);
        _mkdir(sup);
        return this.root + '/users/' + encodeURIComponent(username) + '/' + score + '.html';
    }
    userFileOne(username, score) {
        const sup = this.root + '/users/' + encodeURIComponent(username);
        if (!fs.existsSync(sup)) {
            return false
        }
        const remain = sup + '/' + score + '.html';;
        if (fs.existsSync(remain)) {
            return remain;
        }
        const fss = fs.readdirSync(sup);
        const oss = fss.reduce((p, c) => {
            c.match(/.html$/);
            if (/.html$/.test(c)) {
                p.push(c)
            }
            return p;
        }, [])
        if (oss.length == 0) {
            return false;
        }
        if (oss.length == 1) {
            return sup + '/' + oss[0];
        }
        const _toNum = (str) => {
            const a1 = str.match(/^(\S+).html$/);
            return parseInt(a1[1].split('.').join(''));
        }
        const rs = oss.sort((a, b) => {
            return _toNum(a) < _toNum(b) ? 1 : -1;
        })
        return sup + '/' + rs[0];
    }
    stamp() {
        return `${this.root}/stamp.txt`
    }
    userPage(username) {
        const reg = REGION[this.info.region];
        if (!reg) {
            return;
        }
        return `https://classic.warcraftlogs.com/character/cn/${encodeURIComponent(reg)}/${encodeURIComponent(username)}#zone=${this.info.zone}&size=25`;
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
    1026: 'ULD',
}

export const FAC = {
    1: '联盟',
    2: '部落',
}

export const RACS = {
    DeathKnight: ['Blood', 'Frost', 'Unholy'],
    Druid: ['Balance', 'Feral'],
    Hunter: ['BeastMastery', 'Survival', 'Marksmanship'],
    Mage: ['Arcane', 'Fire', 'Frost'],
    Paladin: ['Retribution'],
    Priest: ['Shadow'],
    Rogue: ['Assassination', 'Combat'],
    Shaman: ['Enhancement', 'Elemental'],
    Warlock: ['Affliction', 'Demonology', 'Destruction'],
    Warrior: ['Arms', 'Fury'],
};

export const cls = [
    ['DeathKnight', '死骑'],
    ['Druid', '德鲁伊'],
    ['Hunter', '猎人'],
    ['Mage', '法师'],
    ['Paladin', '圣骑'],
    ['Priest', '牧师'],
    ['Rogue', '潜行者'],
    ['Shaman', '萨满'],
    ['Warlock', '术士'],
    ['Warrior', '战士'],
];
export const specs = [
    [['Blood', '鲜血'], ['Frost', '冰霜'], ['Unholy', '邪恶']],
    [['Balance', '平衡'], ['Feral', '野性']],
    [['BeastMastery', '野兽'], ['Survival', '生存'], ['Marksmanship', '射击']],
    [['Arcane', '奥术'], ['Fire', '火焰'], ['Frost', '冰霜']],
    [['Retribution', '惩戒']],
    [['Shadow', '暗影']],
    [['Assassination', '奇袭'], ['Combat', '狂徒']],
    [['Enhancement', '增强'], ['Elemental', '元素']],
    [['Affliction', '痛苦'], ['Demonology', '恶魔'], ['Destruction', '毁灭']],
    [['Arms', '武器'], ['Fury', '狂怒']]

];
export const COMPS = {
    "DeathKnight-Blood": '00',
    "DeathKnight-Frost": '01',
    "DeathKnight-Unholy": '02',
    "DeathKnight-Lichborne": '03',
    "DeathKnight-Runeblade": '04',
    "DeathKnight-BloodDPS": '05',
    "Druid-Balance": '10',
    "Druid-Feral": '11',
    "Druid-Guardian": "12",
    "Druid-Restoration": "13",
    "Druid-Warden": "14",
    "Hunter-BeastMastery": '20',
    "Hunter-Survival": '21',
    "Hunter-Marksmanship": '22',
    "Mage-Arcane": '30',
    "Mage-Fire": '31',
    "Mage-Frost": '32',
    "Paladin-Holy": '40',
    "Paladin-Protection": '41',
    "Paladin-Retribution": '42',
    "Paladin-Justicar": '43',
    "Priest-Discipline": '50',
    "Priest-Holy": '51',
    "Priest-Shadow": '52',
    "Rogue-Assassination": '60',
    "Rogue-Combat": '61',
    "Rogue-Subtlety": '62',
    "Shaman-Elemental": '70',
    "Shaman-Enhancement": '71',
    "Shaman-Restoration": '72',
    "Warlock-Affliction": '80',
    "Warlock-Demonology": '81',
    "Warlock-Destruction": '82',
    "Warrior-Arms": '90',
    "Warrior-Fury": '91',
    "Warrior-Protection": '92',
    "Warrior-Gladiator": '93',
    "Warrior-Champion": '94',
    "Warrior-Melee": '95'
}
export const COMPS_CN = {
    "DeathKnight-Blood": '死骑-鲜血',
    "DeathKnight-Frost": '死骑-冰霜',
    "DeathKnight-Unholy": '死骑-邪恶',
    "DeathKnight-Lichborne": '死骑-巫妖',
    "DeathKnight-Runeblade": '死骑-符文',
    "DeathKnight-BloodDPS": '死骑-鲜血',
    "Druid-Balance": '德鲁伊-平衡',
    "Druid-Feral": '德鲁伊-野性',
    "Druid-Guardian": '德鲁伊-守护',
    "Druid-Restoration": '德鲁伊-恢复',
    "Druid-Warden": '德鲁伊-典狱',
    "Hunter-BeastMastery": '猎人-野兽',
    "Hunter-Survival": '猎人-生存',
    "Hunter-Marksmanship": '猎人-射击',
    "Mage-Arcane": '法师-奥术',
    "Mage-Fire": '法师-火焰',
    "Mage-Frost": '法师-冰霜',
    "Paladin-Holy": '圣骑-神圣',
    "Paladin-Retribution": '圣骑-惩戒',
    "Paladin-Protection": '圣骑-防护',
    "Paladin-Justicar": '圣骑-正义',
    "Priest-Discipline": '牧师-戒律',
    "Priest-Holy": '牧师-神圣',
    "Priest-Shadow": '牧师-暗影',
    "Rogue-Assassination": '潜行者-奇袭',
    "Rogue-Combat": '潜行者-狂徒',
    "Rogue-Subtlety": '潜行者-敏锐',
    "Shaman-Elemental": '萨满-元素',
    "Shaman-Enhancement": '萨满-增强',
    "Shaman-Restoration": '萨满-恢复',
    "Warlock-Affliction": '术士-痛苦',
    "Warlock-Demonology": '术士-恶魔',
    "Warlock-Destruction": '术士-毁灭',
    "Warrior-Arms": '战士-武器',
    "Warrior-Fury": '战士-狂怒',
    "Warrior-Protection": '战士-防御',
    "Warrior-Gladiator": '战士-角斗士',
    "Warrior-Champion": '战士-冠军',
    "Warrior-Melee": '战士-混战'
}


export const skipTalent = (k, spec) => {

    if (k == 'DeathKnight') {
        switch (spec) {
            case "Lichborne":
            case "Runeblade":
                return true;
        }
        return false;
    }
    if (k == 'Druid') {
        switch (spec) {
            case "Warden":
                return true;
        }
        return false;
    }
    if (k == 'Warrior') {
        switch (spec) {
            case "Protection":
            case "Gladiator":
            case "Champion":
            case "Melee":
                return true;
        }
        return false;
    }
    return false;
}

export const log = (...arg) => {
    console.log(moment().format('HH:mm:ss'), ...arg);
}