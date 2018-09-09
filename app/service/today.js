'use strict';

const Service = require('egg').Service;
class TodayService extends Service {
    newAndSave(name, link, seed) {
        const today = new this.ctx.model.Today();
        today.name = name;
        today.link = link;
        today.seed = seed;
        return today.save();
    }
    saveMany(arr) {
        this.ctx.model.Today.deleteMany().exec();
        return this.ctx.model.Today.create(arr);
    }
    delete() {
        return this.ctx.model.Today.deleteMany().exec();
    }
}

module.exports = TodayService;