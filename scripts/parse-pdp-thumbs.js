const fs = require('fs')
const html = fs.readFileSync(
  'f:/Aftinox/sambhavi-wesbsite/sambhavi-handloom/tmp-gallery-check/pdp.html',
  'utf8',
)
for (const n of [1, 2, 3]) {
  const label = `aria-label="View image ${n}"`
  const i = html.indexOf(label)
  console.log('---', label, 'at', i)
  console.log(html.slice(i, i + 450))
}
