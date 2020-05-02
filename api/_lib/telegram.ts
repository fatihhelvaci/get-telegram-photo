import { NowRequest, NowResponse } from '@now/node'
import cheerio from 'cheerio'
import got from 'got'

export async function getAvatarImage(username: string) {
  const response = await got(`https://t.me/${username}`)

  const $$ = cheerio.load(response.body)
  const $image = $$('.tgme_page_photo_image')

  if ($image.html() === null) {
    throw {
      message: 'username not found',
    }
  }

  const imageUrl = $image.attr('src')
  const { headers, rawBody } = await got(imageUrl)

  const contentType = headers['content-type']
  const contentLength = headers['content-length']

  return {
    buffer: rawBody,
    contentType,
    contentLength,
    headers,
  }
}

export async function getAvatarImageHandler(req: NowRequest, res: NowResponse) {
  const query = `${req.query.query}` || null

  const regex = /^([a-zA-Z0-9_]{4,})(?:\.jpg)?$/
  const captured = regex.exec(query)

  try {
    if (!captured) {
      throw {
        message: 'invalid username',
      }
    }

    const username = captured[1]
    const img = await getAvatarImage(username)

    const pluckHeaders = [
      'content-type',
      'content-length',
      'cache-control',
      'expires',
      'last-modified',
      'accept-ranges',
    ]
    for (const header of pluckHeaders) {
      res.setHeader(header, img.headers[header])
    }

    res.send(img.buffer)
  } catch ({ statusCode = 500, message = 'internal server error' }) {
    res.statusCode = statusCode
    res.json({
      statusCode,
      error: message,
    })
  }
}
