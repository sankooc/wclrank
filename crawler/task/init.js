import fs from 'node:fs';
import { ColdDown } from './constans.js';
export const build = (cd, info) => {
  const cold = new ColdDown(cd, info);
  
}