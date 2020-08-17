import "cross-fetch/polyfill";

import { NowApiHandler } from "@vercel/node";
import cheerio from "cheerio";

const handler: NowApiHandler = async (req, res) => {
  try {
    const username = `${req.query.username}`;

    const resp = await fetch(`https://t.me/${username}`);
    const $ = cheerio.load(await resp.text());
    const $image = $(".tgme_page_photo_image");
    const imageSrc = $image.attr("src");

    if (!imageSrc) {
      throw new Error(`username '${username}' not found`);
    }

    res.writeHead(308, { Location: imageSrc }).end();
  } catch ({ status = 500, message = "internal server error" }) {
    res.status(status).json({ status, message });
  }
};

export default handler;
