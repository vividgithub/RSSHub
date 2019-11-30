const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://entagma.com/',
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const articles = $('div article');

    // const list = $('.publication').slice(0, 30);
    // let itemPicUrl;
    // let itemDecription;
    // let itemAuthorInfomation;
    // let itemPDFLink;

    ctx.state.data = {
        title: 'Entagma Houdini Tutorial',
        link: 'https://entagma.com/',
        item: articles
            .map((_, item) => {
                item = $(item);
                return {
                    title: item
                        .find('h2 a')
                        .first()
                        .text(),
                    description: `<p>${item
                        .find('div p')
                        .first()
                        .text()}</p><br><img src=${item
                        .find('div img')
                        .first()
                        .attr('src')}>`,
                    link: item
                        .find('h2 a')
                        .first()
                        .attr('href'),
                };
            })
            .get(),
    };
};
