import config from 'config';
import moment from 'moment';
import { ColdDown, log } from './task/constans.js';
import { build as rank } from './task/rank.js';
import { build as user } from './task/user.js';
import { build as combine } from './task/combine.js';
import { build as making } from './task/making.js';
const { versions } = config;


// moment.locale('zh');
const cur = moment().startOf('week').add(4, 'days');
const d = cur.toDate().getTime();


const start = async (cd) => {
  for (const version of versions) {
    const { limit } = version;
    log('start', cd, 'on limit[' + limit + ']')
    const c = new ColdDown(cd, version);
    c.init();
    await rank(c)
    const { total, infos } = await user(c);
    if (infos >= limit) {
      await combine(c);
      await making(c);
    }
  }
}
if (d > Date.now()) {
  await start(cur.subtract(7, 'days').format('MMDD'));
} else {
  await start(cur.format('MMDD'));
}