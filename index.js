import {build} from './ranking.js';


const region = '5042';
const zone = '1025';
const faction = '1';
const start = 21;
const maxPage = 51;
const rname = '碧玉矿洞';

await build(region, zone, faction, start, maxPage, rname);