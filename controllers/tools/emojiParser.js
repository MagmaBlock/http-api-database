import _ from 'lodash'

export default {
  stringify,
  parse
}

function stringify(text) { // 转义

  if (typeof text !== 'string') text = JSON.stringify(text)

  let emojis = text.match(/[\u{10000}-\u{10FFFF}]*/gu);

  emojis = _.compact(emojis)
  emojis = _.uniq(emojis)

  for (let i in emojis) {
    let thisEncodeEmoji = `[emoji:${encodeURIComponent(emojis[i])}]`
    text = text.replaceAll(emojis[i], thisEncodeEmoji)
  }
  return text
}


function parse(text) { // 解析

  if (typeof text !== 'string') text = JSON.stringify(text)

  let emojis = text.match(/\[emoji\:.*?\]/g)
  emojis = _.uniq(emojis)

  for (let i in emojis) {
    let emoji = emojis[i].replaceAll('[emoji:', '')
    emoji = emoji.replaceAll(']', '')
    emoji = decodeURIComponent(emoji)
    text = text.replaceAll(emojis[i], emoji)
  }
  return text
}