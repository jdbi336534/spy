'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = {
      code: 200,
      msg: "ok"
    };
  }
  async test() {
    let res = await this.ctx.service.getList.list();
    // if(!res){return;}
    await this.ctx.service.today.saveMany(res.top);
    
    this.ctx.body = res;
  }
  async todb() {
    // await this.ctx.service.today.newAndSave('非典型少年第二季', 'https://www.22tu.cc/html/24395.html', 'thunder://QUFodHRwOi8vdmlwLnp1aWt1OC5jb20vMTgwOS/miJjniq8tMDEubXA0Wlo=');
    await this.ctx.service.today.saveMany();
  }
  async delete() {
    let res = await this.ctx.service.today.delete();
    this.ctx.body = res
  }
  async detail() {
    let res = await this.ctx.service.getList.getDetail('https://www.22tu.cc/html/24450.html');
    this.ctx.body = res;
  }
}

module.exports = HomeController;