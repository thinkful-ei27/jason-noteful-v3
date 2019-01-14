const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true,
    unique: true
  }
});

tagSchema.set('timestamps', true);

tagSchema.set('toJSON', {
  virtuals: true,
  transfom: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Tag', tagSchema);

