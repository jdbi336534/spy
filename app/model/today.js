'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const TodaySchema = new Schema({
    name: {
      type: String
    },
    link: {
      type: String,
      default: ''
    },
    img: {
      type: String,
      default: ''
    },
    seed: {
      type: String,
      default: ''
    },
    update_at: {
      type: Date,
      default: Date.now
    },
  });
  // 不需要版本号这个字段我们设置一下就好
  // {versionKey:false}
  TodaySchema.pre('save', function (next) {
    const now = new Date();
    this.update_at = now;
    next();
  });
  return mongoose.model('Today', TodaySchema);
};