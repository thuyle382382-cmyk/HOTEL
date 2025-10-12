const Item = require('../models/item');

// Get all items
exports.getItems = async (req, res, next) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Create a new item
exports.createItem = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newItem = new Item({ name, description });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
};
