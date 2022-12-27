import axios from "axios"
import dayjs from "dayjs"
import { BangumiAPI } from "../../common/api.js"
import { promiseDB } from "../../common/databaseConnection.js"
import logger from "../log/logger.js"

export async function cdnGetImage(req, res) {
  console.log(req.originalUrl);
  let requestPath = req.params[0]
  let eachPath = requestPath.split('/')
  let fileName = eachPath[eachPath.length - 1]
  let subjectID = fileName.split('_')[0]

  let nsfw
  try {
    nsfw = await isNSFW(subjectID)
  } catch (error) {
    logger(req, '', '服务器出错')
    return res.status(500).end()
  }

  // nsfw 指数较高(>=8)或不知名条目将不再回源
  if (nsfw.blocked || nsfw.unknown) {
    logger(req, '拒绝回源', `[${nsfw.score}]${nsfw.blocked ? '(NSFW?)' : ''}${nsfw.unknown ? '过于冷门' : ''}`)
    return res.status(403).end()
  }

  let imageFile
  try {
    let image = await axios({
      method: 'GET',
      baseURL: 'https://lain.bgm.tv/',
      url: '/' + requestPath,
      responseType: 'arraybuffer'
    })
    if (image.status == 200) {
      imageFile = image.data
    }
  } catch (error) {
    if (error.response.status == 404) { // 源站报告无此图片
      logger(req, '', 'lain.bgm.tv 报告 404')
      return res.status(404).end()
    }
  }
  res.set('Content-Type', 'image/jpeg')
  res.send(imageFile)
  logger(req, '', '成功')
}



const tagDict = {
  must: [
    '泡面里番', '3D里番', '里番', 'R18|18+|18X|18禁', '鬼父',
    '缘之空', '无码', '有码', '人妻', '重口', '工口', '重口味',
    'H', '母系', '里番也放上来大丈夫？', '空之色水之色', ' 艳母',
    '轮X', '柚子社', '美少女万华镜', 'alicesoft', 'ωstar', 'InnocentGrey',
    '成年コミック', '肉块', '调教', '政治', '肛交', '内射', '口交', '拔作'
  ],
  perhaps: [
    '卖肉|肉番|肉', '巨乳', '纯爱', '人渣诚', '魔人',
    'BL', '伦理', '3D', '下限', '人渣', '兄妹', '兄控',
    '姐弟恋', '耽美', '非人类', '女教师', 'R17', 'R17漫改', 'JK',
    '扶她', 'galgame', '猎奇', 'GAL', 'NTR', '桐谷华', '伪娘',
    '血腥', '后宫', '网盘见', '乙女向', 'GAL改', '内衣', '啪啪啪', '剧情'
  ]
}


/**
 * 判断此 subjectData 对应的条目为 NSFW 的可能性
 * @param {Object} subjectID
 * @returns {Object} name 标题, blocked 是否禁止, score 评分
 */
async function isNSFW(subjectID) {
  try {
    let isInDB = await promiseDB.query('SELECT * FROM nsfw WHERE subject_id = ?', [subjectID])
    if (isInDB[0].length && isInDB[0][0]?.create_time) { // 数据库中找到相关数据
      let data = isInDB[0][0]
      let expiredTime = dayjs(data.create_time).add(1, 'months')
      if (expiredTime > new Date()) { // 没过期
        return {
          name: data.name,
          blocked: Boolean(data.blocked), score: data.score, // 如果分数大于等于 8, 将会建议屏蔽
          unknown: Boolean(data.unknown)
        }
      }
    }
  } catch (error) {
    console.error(error, '读取数据库 nfsw 时发生错误, subject_id =', subjectID);
    throw '读取数据库 nfsw 时发生错误, subject_id =', subjectID
  }

  let subjectData

  try {
    subjectData = await BangumiAPI.get('/v0/subjects/' + subjectID)
    if (subjectData.status == 200) {
      subjectData = subjectData.data // 继续下一步
    }
  } catch (error) {
    if (error.response.status == 404) { // 无法获取 API
      return {
        name: '(NSFW or 404)', blocked: true, score: -1, unknown: false
      }
    } else {
      console.error(error);
      console.error('OSS 向服务端请求回源图片时, 拉取 BangumiAPI 失败！');
      throw 'OSS 向服务端请求回源图片时, 拉取 BangumiAPI 失败！'
    }
  }

  // 条目评分
  let score = 0

  // 用词典去找 tags 里的符合词
  for (let word of tagDict.must) {
    let reg = new RegExp('^' + word + '$', 'i')
    for (let tag of subjectData.tags) {
      if (tag.count > 3 && reg.test(tag.name)) {
        score = score + 4
        break
      }
    }
  }
  for (let word of tagDict.perhaps) {
    let reg = new RegExp('^' + word + '$', 'i')
    for (let tag of subjectData.tags) {
      if (tag.count > 3 && reg.test(tag.name)) {
        score = score + 1
        break
      }
    }
  }

  // 结果
  let nsfw = {
    name: subjectData.name_cn ?? subjectData.name,
    blocked: score >= 8 ? true : false, score: score, // 如果分数大于等于 8, 将会建议屏蔽
    unknown: isUnknown(subjectData)
  }

  try {
    promiseDB.query(
      `INSERT INTO nsfw (subject_id, name, blocked, score, unknown)
      VALUES (?,?,?,?,?)
      ON DUPLICATE KEY UPDATE name = ?, blocked = ?, score = ?, unknown = ?`,
      [
        subjectID, nsfw.name, nsfw.blocked, nsfw.score, nsfw.unknown,
        nsfw.name, nsfw.blocked, nsfw.score, nsfw.unknown
      ]
    )
  } catch (error) {
    console.error(error, 'CDN 图片回源时数据库写入出错');
  }

  return nsfw
}

/**
 * 返回是否不够知名 (收藏量极低 < 50)
 * @param {Object} subjectData 
 * @returns {Boolean} 为真时意为不知名
 */
function isUnknown(subjectData) {
  // 判断当前条目的收藏人数, 若太少, 将不再回源
  let totalColl = 0
  Object.keys(subjectData.collection).forEach(collName => {
    totalColl = totalColl + subjectData.collection[collName]
  })
  if (totalColl < 10) {
    return true
  } else return false
}