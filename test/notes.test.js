'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful test API', function() {

    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
            .then(()=> mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () {
        return Note.insertMany(notes);
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
              expect(res.body).to.be.a('array');
              expect(res.body).to.have.length(data.length);
            });
        });
      });

    describe('GET /api/notes/:id', function () {
        it('should return correct note', function () {
            let data;
            // first, call teh database
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
                    expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          
                    // third compare database results to API response
                    expect(res.body.id).to.equal(data.id);
                    expect(res.body.title).to.equal(data.title);
                    expect(res.body.content).to.equal(data.content);
                    expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
                    expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
                });
        });
    });

    describe('POST /api/notes', function (){
        it('should create and return a new item when provided valid data', function (){
            const newItem = {
                'title': 'The best article about cats ever!',
                'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
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
                expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
                // second call the database
                return Note.findById(res.body.id);
                })
                // third compare API response to database request
                .then(data => {
                    expect(res.body.id).to.equal(data.id);
                    expect(res.body.title).to.equal(data.title);
                    expect(res.body.content).to.equal(data.content);
                    expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
                    expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
              });
        });
    });

   describe('PUT /api/notes', function() {
       it('should put and update file when given valid data', function () {
        const updateItem = {
            'title': 'The best bob!',
            'content': 'Bob Lorem bob ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
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