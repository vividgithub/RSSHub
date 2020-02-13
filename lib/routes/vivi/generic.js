const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const messageBase64 = ctx.params.data;
    const messageDecoded = new Buffer(messageBase64, 'base64').toString();
    const message = JSON.parse(messageDecoded);

    const title = message.title;
    const link = message.link;
    const description = message.description || title;

    const fetchLink = message.fetchLink || link;
    const response = await got({
        method: 'get',
        url: fetchLink,
    });
    const data = response.data;
    const query = cheerio.load(data);

    let $ = null;
    if (message.queryRoot) {
        const rootDom = query(message.queryRoot).first();
        $ = (selector) => query(selector, rootDom);
    } else {
        $ = query;
    }

    const itemTitles = [];
    $(message.queryTitle).each((i, e) => {
        if (message.queryTitleAttr) {
            itemTitles[i] = $(e).attr(message.queryTitleAttr);
        } else {
            itemTitles[i] = $(e).text();
        }
    });

    const itemDescriptions = itemTitles;
    if (message.queryDescription) {
        $(message.queryDescription).each((i, e) => {
            if (message.queryDescriptionAttr) {
                itemDescriptions[i] = $(e).attr(message.queryDescriptionAttr);
            } else {
                itemDescriptions[i] = $(e).text();
            }
        });
    }

    const itemImages = [];
    if (message.queryImage) {
        $(message.queryImage).each((i, e) => {
            const src = $(e).attr('src');
            itemImages[i] = src;
        });
    }

    const itemLinks = [];
    $(message.queryLink).each((i, e) => (itemLinks[i] = $(e).attr('href')));

    const items = [];
    for (let i = 0; i < itemTitles.length; ++i) {
        items[i] = {
            title: itemTitles[i],
            description: message.queryImage ? `<p>${itemDescriptions[i]}</p><br><img src="${itemImages[i]}">` : itemDescriptions[i],
            link: itemLinks[i],
        };
    }

    ctx.state.data = {
        title: title,
        link: link,
        description: description,
        item: items,
    };
};
