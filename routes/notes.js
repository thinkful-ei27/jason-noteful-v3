'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;

  const { folderId } = req.query;
  let filter = {};
  
  if (searchTerm) {
      const re = new RegExp(searchTerm, 'i');
      filter.$or = [{ 'title': re }, { 'content': re }];
    }

  if (folderId) {
    filter = {'folderId': folderId };
  }

  Note.find(filter)
    .sort({ updatedAt: 'desc' })
    .then(results => {
      if (results) {  
          res.json(results);
        } else { 
          next();
        }
    })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
const { id } = req.params;
Note.findById(id)
.then(results => {
  if (results) {  
    res.json(results);
  } else { 
    next();
  }
})
.catch(err => {
  console.error(`ERROR: ${err.message}`);
  console.error(err);
});
});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const {title, content, folderId } = req.body;
  console.log('Create a Note');
  //CREATE A DOCUMENT

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const newNote = {title, content, folderId};

  Note.create(newNote)
  .then(result => {
    res.location(`${req.originalUrl}/${result.id}`)
      .status(201)
      .json(result);
  })
  .catch(err => {
   if (err.code === 11000) {
     err = new Error('The foldernamealready  exists');
     err.status=400;
   }
     next(err);
  });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateNote = { title, content, folderId };

  console.log('Update a Note');
  // UPDATE NOTE BY ID
  Note.findByIdAndUpdate(id, updateNote, { new: true })
  .then(result => {
    if (result) {
      res.json(result);
    } else {
      next();
    }
  })
  .catch(err => {
   if (err.code === 11000) {
     err = new Error('The note name already  exists');
     err.status=400;
   }
     next(err);
  });
});

router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  // DELETE NOTE BY ID
   Note.findByIdAndRemove(id)
   .then(() => {
    res.status(204).end();
  })
  .catch(err => {
    next(err);
  });
});

module.exports = router;
