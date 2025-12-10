import { readFileSync } from 'fs';

const data = [...Array(12).keys()]
  .map(n => `${(n >= 9 ? '' : '0')}${n + 1}.json`)
  .map(f => readFileSync(`./src/data/events-by-month/${f}`))
  .map(s => JSON.parse(s))
  .reduce((a, b) => a.concat(b));

process.stdout.write(JSON.stringify(data));
