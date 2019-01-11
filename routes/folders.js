'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
    const { searchTerm } = req.query;
    let filter = {};

    if (searchTerm) {
        const re = new RegExp(searchTerm, 'i');
        filter = {'name': re};
    }

   Folder.find(filter)
    .sort({name: 'asc'})
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
router.get('/:id', (req,res, next) =>
{
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status  = 400;
        return next(err);
    }

    Folder.findById(id)
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
    const {name} = req.body;

    if (!name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    const newFolder = { name };

    Folder.create(newFolder)
    .then(result => {
        res.location(`${req.originalUrl}/${result.id}`)
            .status(201)
            .json(result);
    })
    .catch(err => {
        if (err.code === 11000) {
            err = new Error('The folder name already exists');
            err.status=400;
        }
        next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongooose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
    }

    const updateFolder = { name };

    Folder.findByIdAndUpdate(id, updateFolder, { new: true })
    .then(result => {
        if (result) {
            res.json(result);
        } else {
            next();
        }
    })
    .catch(err => {
        if (err.code === 11000) {
            err = new Error('The folder name already exists');
            err.status=400;
        }
        next(err);
    });
});

router.delete('/:id', (req, res, next) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
    }

    Folder.findByIdAndRemove(id)
    .then(() => {
        res.status(204).end();
    })
    .catch(err => {
        next(err);
    });
});

module.exports = router;
