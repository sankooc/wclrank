
import { RACS, COMPS, cls, specs } from './task/constans.js';


// for(let i = 0;i<cls.length; i+=1){
//   const cc = cls[i];
//   const spps = specs[i];
//   for(let j =0;j < spps.length; j +=1){
//     const spec = spps[j];
//     console.log(`"${cc[0]}-${spec[0]}": '${cc[1]}-${spec[1]}',`);
//   }
// }

// const ll = []
// for(const c of specs){
//   // console.log(c)
//   ll.push(`{${c.map(l => '"'+l[1]+'"').join(', ')}}`);
//   // for(const s of c){
//   //   console.log(`{${ll.map(l => '"'+l+'"').join(', ')}`);
//   // }
//   // ll.push(c[1]);
// }

// console.log(`local CLASSES = {${ll.map(l => '"'+l+'"').join(', ')}}`)

// console.log(`local SPECS = {${ll.map(l => l).join(', ')}}`)




let i = 0;
for (const k of cls) {
  let j = 0
  for (const spec of specs[i]) {
    console.log(`checking("${i}${j}", "${spec[1]}${k[1]}")`);
    j += 1;
  }
  i += 1;
}

// for(const cp of Object.keys(COMPS)){
//   const [k, spec] = cp.split('-')
//   console.log(k, spec);
// }