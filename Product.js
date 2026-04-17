const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  productURL: {
    type: String,
    required: [true, 'Product URL is required'],
    trim: true,
  },
  targetPrice: {
    type: Number,
    required: [true, 'Target price is required'],
    min: [0, 'Target price must be positive'],
  },
  currentPrice: {
    type: Number,
    default: null,
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    trim: true,
    lowercase: true,
  },
  platform: {
    type: String,
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'tata', 'purplle', 'unknown'],
    default: 'unknown',
  },
  notified: {
    type: Boolean,
    default: false,
  },
  lastChecked: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-detect platform from URL before saving
productSchema.pre('save', function (next) {
  const url = this.productURL.toLowerCase();
  if (url.includes('amazon')) this.platform = 'amazon';
  else if (url.includes('flipkart')) this.platform = 'flipkart';
  else if (url.includes('myntra')) this.platform = 'myntra';
  else if (url.includes('ajio')) this.platform = 'ajio';
  else if (url.includes('nykaa')) this.platform = 'nykaa';
  else if (url.includes('tatacliq') || url.includes('1mg') || url.includes('tira')) this.platform = 'tata';
  else if (url.includes('purplle')) this.platform = 'purplle';
  else this.platform = 'unknown';
  next();
});

module.exports = mongoose.model('Product', productSchema);
