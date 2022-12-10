import { createHash } from 'crypto';
import logger from '../log/logger.js';
import requestData from '../request/requestData.js';

let store = {
  /*
  'downloadKey': {
    fileContent: ...,
    fileName: ...
  }
  */
}

let outDateTime = 5 * 60 * 1000

export async function uploadFileAPI(req, res) {
  let apiName = 'uploadFileAPI'

  let { fileName, fileContent } = req.body
  if (!fileName || !fileContent) return res.send({ code: 400, message: '参数错误' })
  let downloadKey = createHash('sha1') // 为此文件创建一个下载的密钥
    .update(fileName + new Date().getTime())
    .digest('hex')

  // 将文件存储到内存
  store[downloadKey] = {
    fileContent, fileName
  }
  // 设置文件定时删除
  setTimeout(() => {
    delete store[downloadKey]
    console.log('删除过期临时文件: ', fileName);
  }, outDateTime);

  // 回复客户端
  let message = '成功'
  res.send({
    code: 200,
    message,
    data: {
      downloadKey
    }
  })
  logger(req, fileName, message)
}

export async function downloadFileAPI(req, res) {
  let apiName = 'downloadFileAPI'

  let downloadKey = req.params.key
  if (store[downloadKey]) {
    let { fileContent, fileName } = store[downloadKey]
    res.set('Content-Type', 'application/octet-stream')
    res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    res.send(fileContent)
    logger(req, downloadKey, '已发送文件')
  }
  else {
    let message = '文件已过期或不存在'
    res.status(404).send(message)
    logger(req, downloadKey, message)
  }
}