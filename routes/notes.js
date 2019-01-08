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
  const updateId = req.params.id;
  const newData = req.body;
  console.log('Update a Note');
  // UPDATE NOTE BY ID
  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    return Note.findByIdAndUpdate(updateId, 
      newData,
      {upsert: true, new: true});
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

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  const deleteId = req.params.id;

  // DELETE NOTE BY ID
  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    return Note.findByIdAndRemove(deleteId);
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

module.exports = router;
