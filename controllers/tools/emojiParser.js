import emojiRegex from 'emoji-regex';

export default {
  stringify,
  parse
}


function stringify(text) { // 转义
  let emojis = text.match(emojiRegex())
  emojis = new Set(emojis) // 去重
  emojis = Array.from(emojis)

  for (let i in emojis) {
    let thisEncodeEmoji = `[emoji:${encodeURIComponent(emojis[i])}]`
    text = text.replaceAll(emojis[i], thisEncodeEmoji)
  }
  return text
}


function parse(text) { // 解析
  let emojis = text.match(/\[emoji\:.*?\]/g)
  emojis = new Set(emojis)
  emojis = Array.from(emojis)

  for (let i in emojis) {
    let emoji = emojis[i].replaceAll('[emoji:', '')
    emoji = emoji.replaceAll(']', '')
    emoji = decodeURIComponent(emoji)
    text = text.replaceAll(emojis[i], emoji)
  }
  return text
}