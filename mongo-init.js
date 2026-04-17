// MongoDB initialization script for AlertCart
// Runs automatically when container starts for first time

db = db.getSiblingDB('alertcart');

// Create collections
db.createCollection('products');

// Create indexes for better query performance
db.products.createIndex({ userEmail: 1 });
db.products.createIndex({ platform: 1 });
db.products.createIndex({ notified: 1 });
db.products.createIndex({ createdAt: -1 });

print('✅ AlertCart MongoDB initialized successfully!');
print('   Database: alertcart');
print('   Collection: products');
print('   Indexes: created');
