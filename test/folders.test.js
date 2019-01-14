'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const { folders } = require ('../db/data');
const expect =chai.expect;
chai.use(chaiHttp);

describe('Noteful test API folders', function() {
    before(function() {
        return mongoose.connect(TEST_MONGODB_URI)
        .then(()=> mongoose.connection.db.dropDatabase());
    });

    beforeEach(function(){
        return Promise.all([
            Folder.insertMany(folders),
            Folder.createIndexes()
        ]);
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function() {
        return mongoose.disconnect();
    });

    describe('GET /api/folders', function () {
        it('should return the correct number of Folders', function () {
            // 1) Call the database **and** the API
            // 2) Wait for both promises to resolve using `Promise.all`
            return Promise.all([
                Folder.find(),
                chai.request(app).get('/api/folders')
            ])
            // 3) then compare database results to API response
            .then(([data, res]) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.length(data.length);
            });
        });

        it('should return list with the correct fields', function () {
             return Promise.all([
                 Folder.find(),
                 chai.request(app).get('/api/notes')
             ])
             .then(([data, res]) => {
                 expect(res).to.have.status(200);
                 expect(res).to.be.json;
                 expect(res.body).to.be.an('array');
                 expect(res.body).to.have.length(data.length);
                 res.body.forEach(function (item, i) {
                     expect(item).to.be.an('object');
                     expect(item).to.include.all.keys('id','name','createdAt','updatedAt');
                     expect(item.id).to.equal(data[i].id);
                     expect(item.name).to.equal(data[i].name);
                     expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
                     expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
                 });
             });
         });

    });

    describe('GET /api/folders/:id', function () {
        it('should return the correct folder', function () {
            let data;
            // first, call the database
            return Folder.findOne()
            .then(_data => {
                data = _data;
                // second, call the API with the ID
                return chai.request(app).get(`/api/folders/${data.id}`);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.keys('id','name','createdAt','updatedAt');

                // third compare database results to API response
                expect(res.body.id).to.equal(data.id);
                expect(res.body.name).to.equal(data.name);
                expect(res.body.createdAt).to.equal(data.createdAt);
                expect(res.body.updatedAt).to.equal(data.updatedAt);
            });
        });
    });

});