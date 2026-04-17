const axios = require('axios');
const cheerio = require('cheerio');

// Common browser headers to avoid bot detection
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
  Referer: 'https://www.google.com/',
};

const parsePrice = (str) => {
  if (!str) return NaN;
  return parseFloat(str.replace(/[₹,\s\u20B9]/g, '').trim());
};

const fetchPage = async (url, extraHeaders = {}) => {
  const { data } = await axios.get(url, {
    headers: { ...HEADERS, ...extraHeaders },
    timeout: 20000,
    maxRedirects: 5,
  });
  return data;
};

const scrapeAmazon = async (url) => {
  try {
    const data = await fetchPage(url);
    const $ = cheerio.load(data);
    const name = $('#productTitle').text().trim() || $('h1.a-size-large').text().trim() || 'Amazon Product';
    const priceText =
      $('.a-price .a-offscreen').first().text().trim() ||
      $('#priceblock_ourprice').text().trim() ||
      $('#priceblock_dealprice').text().trim() ||
      $('.a-price-whole').first().text().trim() ||
      $('#price_inside_buybox').text().trim() ||
      $('#corePrice_feature_div .a-offscreen').first().text().trim() || '';
    const price = parsePrice(priceText);
    if (isNaN(price)) throw new Error('Could not extract Amazon price.');
    return { name, price };
  } catch (err) {
    throw new Error(`Amazon scrape failed: ${err.message}`);
  }
};

const scrapeFlipkart = async (url) => {
  try {
    const data = await fetchPage(url);
    const $ = cheerio.load(data);
    const name =
      $('span.B_NuCI').text().trim() ||
      $('h1._9E25nV').text().trim() ||
      $('h1.yhB1nd').text().trim() ||
      $('h1').first().text().trim() ||
      'Flipkart Product';
    const priceText =
      $('div._30jeq3._16Jk6d').text().trim() ||
      $('div._30jeq3').text().trim() ||
      $('div.Nx9bqj.CxhGGd').text().trim() || '';
    const price = parsePrice(priceText);
    if (isNaN(price)) throw new Error('Could not extract Flipkart price.');
    return { name, price };
  } catch (err) {
    throw new Error(`Flipkart scrape failed: ${err.message}`);
  }
};

const scrapeMyntra = async (url) => {
  try {
    const data = await fetchPage(url);
    const $ = cheerio.load(data);
    const name =
      $('h1.pdp-name').text().trim() ||
      $('.pdp-title').text().trim() ||
      $('h1').first().text().trim() ||
      'Myntra Product';
    const priceText =
      $('.pdp-price strong').first().text().trim() ||
      $('span.pdp-price').first().text().trim() ||
      $('[class*="selling-price"]').first().text().trim() ||
      $('span[class*="price"]').first().text().trim() || '';
    const price = parsePrice(priceText);
    if (isNaN(price)) throw new Error('Could not extract Myntra price. Note: Myntra is JS-rendered; price may not be in static HTML.');
    return { name, price };
  } catch (err) {
    throw new Error(`Myntra scrape failed: ${err.message}`);
  }
};

const scrapeAjio = async (url) => {
  try {
    const data = await fetchPage(url);
    const $ = cheerio.load(data);
    const name =
      $('h1.prod-name').text().trim() ||
      $('[class*="product-title"]').first().text().trim() ||
      $('h1').first().text().trim() ||
      'Ajio Product';
    const priceText =
      $('span.prod-sp').text().trim() ||
      $('.prod-cp').text().trim() ||
      $('[class*="selling-price"]').first().text().trim() ||
      $('span[class*="price"]').first().text().trim() || '';
    const price = parsePrice(priceText);
    if (isNaN(price)) throw new Error('Could not extract Ajio price.');
    return { name, price };
  } catch (err) {
    throw new Error(`Ajio scrape failed: ${err.message}`);
  }
};

const scrapeNykaa = async (url) => {
  try {
    const data = await fetchPage(url, { Referer: 'https://www.nykaa.com/' });
    const $ = cheerio.load(data);
    const name =
      $('h1.product-title').text().trim() ||
      $('h1[class*="title"]').text().trim() ||
      $('h1').first().text().trim() ||
      'Nykaa Product';
    const priceText =
      $('span.price-container').first().text().trim() ||
      $('[class*="offer-price"]').first().text().trim() ||
      $('[class*="selling-price"]').first().text().trim() ||
      $('span[class*="price"]').first().text().trim() || '';
    const price = parsePrice(priceText);
    if (isNaN(price)) throw new Error('Could not extract Nykaa price.');
    return { name, price };
  } catch (err) {
    throw new Error(`Nykaa scrape failed: ${err.message}`);
  }
};

const scrapeTata = async (url) => {
  try {
    const data = await fetchPage(url, { Referer: 'https://www.tatacliq.com/' });
    const $ = cheerio.load(data);
    const name =
      $('h1.ProductDetailsMainCard__productName').text().trim() ||
      $('h1[class*="ProductTitle"]').text().trim() ||
      $('h1.style__name').text().trim() ||
      $('[class*="product-name"]').first().text().trim() ||
      $('h1').first().text().trim() ||
      'Tata Product';
    const priceText =
      $('[class*="selling-price"]').first().text().trim() ||
      $('[class*="offer-price"]').first().text().trim() ||
      $('[class*="PriceBox"]').first().text().trim() ||
      $('span[class*="Price"]').first().text().trim() ||
      $('span[class*="price"]').first().text().trim() || '';
    const price = parsePrice(priceText);
    if (isNaN(price)) throw new Error('Could not extract Tata/1mg price.');
    return { name, price };
  } catch (err) {
    throw new Error(`Tata scrape failed: ${err.message}`);
  }
};

const scrapePurplle = async (url) => {
  try {
    const data = await fetchPage(url, { Referer: 'https://www.purplle.com/' });
    const $ = cheerio.load(data);
    const name =
      $('h1.product-name').text().trim() ||
      $('h1[class*="name"]').text().trim() ||
      $('[class*="product-title"]').first().text().trim() ||
      $('h1').first().text().trim() ||
      'Purplle Product';
    const priceText =
      $('span.product-selling-price').text().trim() ||
      $('[class*="selling-price"]').first().text().trim() ||
      $('[class*="offer-price"]').first().text().trim() ||
      $('span[class*="price"]').first().text().trim() || '';
    const price = parsePrice(priceText);
    if (isNaN(price)) throw new Error('Could not extract Purplle price.');
    return { name, price };
  } catch (err) {
    throw new Error(`Purplle scrape failed: ${err.message}`);
  }
};

const scrapePrice = async (url) => {
  const u = url.toLowerCase();
  if (u.includes('amazon.in') || u.includes('amazon.com')) return await scrapeAmazon(url);
  if (u.includes('flipkart.com')) return await scrapeFlipkart(url);
  if (u.includes('myntra.com')) return await scrapeMyntra(url);
  if (u.includes('ajio.com')) return await scrapeAjio(url);
  if (u.includes('nykaa.com') || u.includes('nykaafashion.com')) return await scrapeNykaa(url);
  if (u.includes('tatacliq.com') || u.includes('1mg.com') || u.includes('tira.com')) return await scrapeTata(url);
  if (u.includes('purplle.com')) return await scrapePurplle(url);
  throw new Error('Unsupported platform. Supported: Amazon, Flipkart, Myntra, Ajio, Nykaa, Tata (TataCliq/1mg/Tira), Purplle.');
};

const detectPlatform = (url) => {
  const u = url.toLowerCase();
  if (u.includes('amazon')) return 'amazon';
  if (u.includes('flipkart')) return 'flipkart';
  if (u.includes('myntra')) return 'myntra';
  if (u.includes('ajio')) return 'ajio';
  if (u.includes('nykaa')) return 'nykaa';
  if (u.includes('tatacliq') || u.includes('1mg') || u.includes('tira')) return 'tata';
  if (u.includes('purplle')) return 'purplle';
  return 'unknown';
};

module.exports = { scrapePrice, detectPlatform };
