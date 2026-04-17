const Product = require('../models/Product');
const { scrapePrice } = require('../services/scraper');

const SUPPORTED_PLATFORMS = ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'tatacliq', '1mg', 'tira', 'purplle'];

const isSupportedURL = (url) => {
  const u = url.toLowerCase();
  return SUPPORTED_PLATFORMS.some(p => u.includes(p));
};

const addProduct = async (req, res) => {
  try {
    const { productURL, targetPrice, userEmail } = req.body;
    if (!productURL || !targetPrice || !userEmail) {
      return res.status(400).json({ success: false, message: 'productURL, targetPrice, and userEmail are required.' });
    }
    if (!isSupportedURL(productURL)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported platform. Supported: Amazon, Flipkart, Myntra, Ajio, Nykaa, Tata (TataCliq/1mg/Tira), Purplle.',
      });
    }

    let name = 'Unknown Product';
    let currentPrice = null;
    try {
      const scraped = await scrapePrice(productURL);
      name = scraped.name;
      currentPrice = scraped.price;
    } catch (scrapeErr) {
      console.warn('Initial scrape failed, saving without price:', scrapeErr.message);
    }

    const product = new Product({
      name,
      productURL,
      targetPrice: parseFloat(targetPrice),
      currentPrice,
      userEmail,
      lastChecked: currentPrice ? new Date() : null,
    });
    await product.save();

    res.status(201).json({ success: true, message: 'Product added successfully!', data: product });
  } catch (err) {
    console.error('addProduct error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { targetPrice, userEmail } = req.body;
    const update = {};
    if (targetPrice !== undefined) update.targetPrice = parseFloat(targetPrice);
    if (userEmail !== undefined) update.userEmail = userEmail;
    update.notified = false;

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, message: 'Product updated.', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const checkProductNow = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const { name, price } = await scrapePrice(product.productURL);
    product.currentPrice = price;
    product.lastChecked = new Date();
    if (!product.name || product.name === 'Unknown Product') product.name = name;
    await product.save();

    res.status(200).json({ success: true, message: `Price checked! Current price: ₹${price}`, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addProduct, getProducts, getProductById, updateProduct, deleteProduct, checkProductNow };
