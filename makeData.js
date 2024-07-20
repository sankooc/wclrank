
import fs from 'node:fs';
import moment from 'moment';


const data = JSON.parse(fs.readFileSync('./data.json'));

// const jsonData = JSON.parse(data);
const items = data.data;

const parse = (item) => {
    return `["${item.name}"] = {{["type"]= "DPS",["rank"] = ${item.rank},["cls"] = "${item.class}",["itemLevel"] = ${item.itemLevel},["val"] = "${item.dps}",["ts"] = "${moment(parseInt(item.ts)).format("MM/DD")}"}}`;
}

const rmdata = items.map((item) => {return parse(item)}).join(',');

fs.writeFileSync('./datas.lua', `wclData={${rmdata}}`);