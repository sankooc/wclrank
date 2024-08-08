import config from 'config';
import moment from 'moment';
import { ColdDown, log } from './task/constans.js';
import { build as rank } from './task/rank.js';
import { build as user } from './task/user.js';
import { build as combine } from './task/combine.js';
import { build as making } from './task/making.js';
const { versions } = config;


// moment.locale('zh');
// const cur = moment().startOf('week').add(4, 'days');
// const d = cur.toDate().getTime();


const v =  moment().format('MM-DD');

for (const version of versions) {
  const c = new ColdDown(version);
  c.init();
  await rank(c, v);
  await user(c);
  await combine(c);
  await making(c);
}