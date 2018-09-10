const Service = require('egg').Service;
const cheerio = require('cheerio');
class GetListService extends Service {
  async list() {
    let userAgent = this.config.userAgents[
      parseInt(Math.random() * this.config.userAgents.length)
    ];
    let { data } = await this.ctx.curl('https://www.22tu.cc', {
      dataType: 'text',
      'User-Agent': userAgent
    });
    let $ = cheerio.load(data);
    // top21
    let list = $('.box.newbox .shot.update ul li');
    let top21 = [];
    list.each((i, item) => {
      top21.push({
        name: $(item)
          .find('a')
          .text(),
        link:
          'https://www.22tu.cc' +
          $(item)
            .find('a')
            .attr('href')
      });
    });
    // 好评
    let trailers = $('.trailers > .img-list > li > a');
    let commentList = [];
    trailers.each((i, item) => {
      commentList.push({
        name: $(item).attr('title'),
        link: 'https://www.22tu.cc' + $(item).attr('href'),
        img:
          'https://www.22tu.cc' +
          $(item)
            .find('img')
            .attr('src')
      });
    });
    // 本周热播
    // 电影
    // 最新电视剧
    // 动漫
    // 综艺
    let combine = $('.box');
    let contentObj = [];
    let sideObj = [];
    combine.each((i, item) => {
        let content = $(item).find('.content');
        let side = $(item).find('.side');
        content.each((i, ele) => {
          let tempObj = {
            title: $(ele)
              .find('.title > h2 > a')
              .text(),
            link:
              'https://www.22tu.cc' +
              $(ele)
                .find('.title > h2 > a')
                .attr('href')
          };
          // 获取title
          let title = $(ele).find('.title > dl > dd > a');
          let titleArray = [];
          title.each((i, tit) => {
            titleArray.push({
              title: $(tit).text(),
              link: 'https://www.22tu.cc' + $(tit).attr('href')
            });
          });
          // 获取电影列表
          let imgList = $(ele).find('.bd > ul');
          let contentImgList = [];
          //   UL遍历
          imgList.each((i, ulList) => {
            //   li遍历
            let imgli = $(ulList).find('li');
            let imgliList = [];
            imgli.each((i, liItem) => {
              imgliList.push({
                img:
                  'https://www.22tu.cc' +
                  $(liItem)
                    .find('a > img')
                    .attr('src'),
                name: $(liItem)
                  .find(' a')
                  .attr('title'),
                link:
                  'https://www.22tu.cc' +
                  $(liItem)
                    .find('a')
                    .attr('href'),
                type: $(liItem)
                  .find('p')
                  .text()
              });
            });
            contentImgList.push({
              ...titleArray[i],
              imgList: imgliList
            });
          });
          tempObj.content = contentImgList;
          contentObj.push(tempObj);
        });
        side.each((i, ele) => {
          let tempObj = {
            title: $(ele)
              .find('.shot > dl > dt > a')
              .text(),
            link:
              'https://www.22tu.cc' +
              $(ele)
                .find('.shot > dl > dt > a')
                .attr('href')
          };
          // 获取title
          let title = $(ele).find('.shot > dl > dd > a');
          let titleArray = [];
          title.each((i, tit) => {
            titleArray.push({
              title: $(tit).text()
            });
          });
          // 获取电影列表
          let imgList = $(ele).find('.shot .bd ul');
          let contentImgList = [];
          //   UL遍历
          imgList.each((i, ulList) => {
            //   li遍历
            let imgli = $(ulList).find('li');
            let imgliList = [];
            imgli.each((i, liItem) => {
              imgliList.push({
                name: $(liItem)
                  .find(' a')
                  .attr('title'),
                link:
                  'https://www.22tu.cc' +
                  $(liItem)
                    .find('a')
                    .attr('href'),
                date: $(liItem)
                  .find('span')
                  .text()
              });
            });
            contentImgList.push({
              ...titleArray[i],
              imgList: imgliList
            });
          });
          tempObj.content = contentImgList;
          sideObj.push(tempObj);
        });
    });
    return {
      top: top21,
      commentList,
      contentList: contentObj,
      newList: sideObj
    };
  }
  async getDetail(url) {
    let userAgent = this.config.userAgents[
      parseInt(Math.random() * this.config.userAgents.length)
    ];
    let { data } = await this.ctx.curl(url, {
      dataType: 'text',
      'User-Agent': userAgent
    });
    let $ = cheerio.load(data);
    let name = $('.view .info h1').text();
    name = name.substring(0,name.length-4);
    let img = 'https://www.22tu.cc' + $('.view .pic img').attr('src');
    let li = $('.view .info ul li');
    let arrInfo = {};
    li.each((i,item)=>{
      switch(i){
        case 0:
        arrInfo.date = $(item).text()
        break;
        case 1:
        arrInfo.director = $(item).find('a').text()
        break;
        case 2:
        let str = '';
        $(item).find('a').each((i,director)=>{
          str += $(director).text() + ' ';
        })
        arrInfo.leadactor = str;
        break;
        case 3:
        arrInfo.region = $(item).find('a').text()
        break;
        case 4:
        arrInfo.update = $(item).find('div').text()
        break;
        case 5:
        arrInfo.score = $(item).find('.span_block').eq(0).text().replace(/\s+/g, '');
        break;
      }
    })
    arrInfo.featurefilm = $('.juqing').find('.endtext').text().replace(/\s+/g, '');
    let seed = $('.endpage .mox .o_list_cn_r .down-title a').attr('source-url');
    return {
      name,
      img,
      seed,
      arrInfo
    }
  }
}
module.exports = GetListService;
