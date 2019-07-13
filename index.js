const cheerio = require('cheerio')
const got = require('got')
const { parse } = require('url')

async function fetchUsernameImage(username) {
  const { body } = await got(`https://t.me/${username}`)
  const $$ = cheerio.load(body)
  return $$('.tgme_page_photo_image').attr('src')
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
module.exports = async (req, res) => {
  const { query } = parse(req.url, true)
  const { u = null } = query

  const Location =
    u !== null
      ? await fetchUsernameImage(u)
      : 'https://github.com/SurabayaJS/get-telegram-photo#usage'

  res.writeHead(301, { Location })
  res.end()
}
