'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const { notes } = require('../db/data');
const Folder = require('../models/folder');
const { folders } = require('../db/data');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful test API notes', function() {
    before(function () {
        return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
            .then(()=> mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () {
        return Promise.all([
            Note.insertMany(notes),
            Folder.insertMany(folders)
        ]);
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function () {
        return mongoose.disconnect();
    });

    describe('GET /api/notes', function () {
        it('should return the correct number of Notes', function () {
        // 1) Call the database **and** the API
        // 2) Wait for both promises to resolve using `Promise.all`
        return Promise.all([
            Note.find(),
            chai.request(app).get('/api/notes')
          ])
          // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengt(data.length);
        });
        });

        it('should return list with the correct fields', function() {
            return Promise.all([
                Note.find().sort({ updatedAt: 'desc'}),
                chai.request(app).get('/api/notes')
            ])
            .then(([data, res]) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.length(data.length);
                res.body.forEach(function (item, i) {
                    expect(item).to.be.an('object');
                    expect(item).to.include.all.keys('id', 'title', 'folderId','createdAt', 'updatedAt');
                    expect(item.id).to.equal(data[i].id);
                    expect(item.title).to.equal(data[i].title);
                    expect(item.content).to.equal(data[i].content);
                    expect(item.folderId).to.equal(data.folderId);
                    expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
                    expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
                });
            });
        });

      });

    describe('GET /api/notes/:id', function () {
        it('should return correct note', function () {
            let data;
            // first, call the database
            return Note.findOne()
                .then(_data => {
                    data = _data;
                    // second, call the API with the ID
                    return chai.request(app).get(`/api/notes/${data.id}`);
                })
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'createdAt', 'updatedAt');
          
                    // third compare database results to API response
                    expect(res.body.id).to.equal(data.id);
                    expect(res.body.title).to.equal(data.title);
                    expect(res.body.content).to.equal(data.content);
                    expect(res.body.folderId).to.equal(data.folderId);
                    expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
                    expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
                });
        });
    });

    describe('POST /api/notes', function (){
        it('should create and return a new item when provided valid data', function (){
            const newItem = {
                'title': 'The best article about cats ever!',
                'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
                'folderId': '101111111111111111111100'
              };

            let res;
            // first, call the API
            return chai.request(app)
            .post('/api/notes')
            .send(newItem)
            .then(function (_res) {
                res = _res;
                expect(res).to.have.status(201);
                expect(res).to.have.header('location');
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'createdAt', 'updatedAt');
                // second call the database
                return Note.findById(res.body.id);
                })
                // third compare API response to database request
                .then(data => {
                    expect(res.body.id).to.equal(data.id);
                    expect(res.body.title).to.equal(data.title);
                    expect(res.body.content).to.equal(data.content);
                    expect(res.body.folderId).to.equal(data.folderId);
                    expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
                    expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
              });
        });
    });

   describe('PUT /api/notes', function() {
       it('should put and update file when given valid data', function () {
        const updateItem = {
            'title': 'The best bob!',
            'content': 'Bob Lorem bob ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
            'folderId': '101111111111111111111103'
          };

          let res;
          // first, find random note to grab its id
          return Note.findOne()
            .then(function(note){
                updateItem.id=note.id;

                return chai.request(app)
                    .put(`/api/notes/${updateItem.id}`)
                    .send(updateItem);
            })
            .then(function (_res) {
                res = _res;
                expect(res).to.have.status(200);
                return Note.findById(updateItem.id);
            })
            .then(function(note) {
                expect(note.title).to.equal(updateItem.title);
                expect(note.content).to.equal(updateItem.content);
                expect(note.folderId).to.equal(updateItem.folderId);
            });
        });

        describe('DELETE endpoint', function() {
            it('should delete a note by id', function () {
                let note;
                return Note.findOne()
                    .then(function(_note) {
                        note = _note;
                        return chai.request(app).delete(`/api/notes/${note.id}`);
                    })
                    .then(function(res) {
                        expect(res).to.have.status(204);
                        return Note.findById(note.id);
                    })
                    .then(function(_note) {
                        expect(_note).to.be.null;
                    });
            });
        });
   }); 


});