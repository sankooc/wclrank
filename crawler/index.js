import config from 'config';
import moment from 'moment';
import { ColdDown } from './task/constans.js';
import { build as init } from './task/init.js';
import { build as rank } from './task/rank.js';
const {versions} = config;


// moment.locale('zh');
const cur = moment().startOf('week').add(4, 'days');
const d = cur.toDate().getTime();

if(d > Date.now()) {
  console.log(cur.subtract(7, 'days').format('MMDD'));
}
for(const version of versions){
  const c = new ColdDown('0725', version);
  c.init();
  await rank(c)
}
// console.log(versions);
// init('0718', versions[0]);

// const region = '5042';
// const zone = '1025';
// const faction = '1';
// const rname = '碧玉矿洞';