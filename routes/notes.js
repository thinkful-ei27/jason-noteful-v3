'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  let filter = {};
  console.log('Get All Notes');
  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    if (searchTerm) {
      filter.title = { $regex: searchTerm, $options: 'i' };
    }
    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    res.json(results);
  })
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
const searchId = req.params.id;
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
.then(() => {
  return Note.findById(searchId);
})
.then(results => {
  res.json(results);
})
.then(() => {
  return mongoose.disconnect()
})
.catch(err => {
  console.error(`ERROR: ${err.message}`);
  console.error(err);
});

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const newNote = req.body;
  console.log('Create a Note');
  //CREATE A DOCUMENT
  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    return Note.create(newNote);
  })
  .then(results => {
    res.json(results);
  })
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.sendStatus(204);
});

module.exports = router;
