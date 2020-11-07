const xlsx = require('xlsx')
const {nomeFile,nomeElemento,campiInfo,campiTabella,chiaviHref,nomeFiglioTabella,nomeInfo,nomeTabella,riconoscimentoUnivoco} = require('./options.json')
const fs = require('fs')

const x = xlsx.readFile(nomeFile)

const foglio1 = x[Object.keys(x.Sheets)[0]]
const json = xlsx.utils.sheet_to_json(x.Sheets[Object.keys(x.Sheets)[0]])

const genTabella = (riga)=>{
  let xt = `<${nomeFiglioTabella}>`
  Object.keys(riga).forEach(key=>{
    if(campiTabella.includes(key)) {
      xt += chiaviHref.includes(key) ?
        `<${key} href="${riga[key]}"/>` :
        `<${key}>${riga[key]}</${key}>`
    }
  })
  xt +=`</${nomeFiglioTabella}>`
  console.log('tabella xt',xt)
  return xt
}
const genInfo = (riga)=>{
  let xt = `<${nomeElemento}>
  <${nomeInfo}>`
  
  Object.keys(riga).forEach(key=>{
    if(campiInfo.includes(key)) {
      xt += chiaviHref.includes(key) ?
        `<${key} href="${riga[key]}"/>` :
        `<${key}>${riga[key]}</${key}>`
    }
  })
  xt +=`</${nomeInfo}><${nomeTabella}>`
  return xt
}
const partialResult = json.reduce((acc,cur)=>{
  const ru = cur[riconoscimentoUnivoco]
  if(!ru || !ru.length) throw new Error('una riga non contiene il riconoscimento univoco')
  const riga = acc.find(riga => riga.ru == ru)
  if(!riga){
    acc.push({ru,xml:''+genInfo(cur)+genTabella(cur)})
  } else {
    riga.xml += genTabella(cur)
  }
  return acc
},[])
const xmlPartialResult = partialResult.map(el => `${el.xml}</${nomeElemento}>`).join()

const result = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    ${xmlPartialResult}
  </Root>`

fs.writeFile('./result.xml',result,()=>process.exit[0])