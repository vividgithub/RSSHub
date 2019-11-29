const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.disneyanimation.com/technology/publications',
    });

    const data = response.data;
    logger.info(response.data);

    const $ = cheerio.load(data);
    const list = $('.publication').slice(0, 30);
    let itemPicUrl;
    let itemDecription;
    let itemAuthorInfomation;
    let itemPDFLink;

    ctx.state.data = {
        title: 'Walt Disney Animation Publications',
        link: 'https://www.disneyanimation.com/technology/publications',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item
                        .find('img')
                        .first()
                        .attr('src');
                    itemDecription = item
                        .find('p.publication-body')
                        .first()
                        .text();
                    itemAuthorInfomation = item
                        .find('p.publication-authors')
                        .first()
                        .text();
                    itemPDFLink = item
                        .find('a.pdf')
                        .first()
                        .attr('href');
                    return {
                        title: `${item
                            .find('h3')
                            .first()
                            .text()}`,
                        description: `Author: ${itemAuthorInfomation}<br>Description: ${itemDecription}<br><img src=${itemPicUrl}>`,
                        link: `${itemPDFLink}`,
                    };
                })
                .get(),
    };
};
