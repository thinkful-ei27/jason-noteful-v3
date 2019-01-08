const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// GET by SEARCHTERM
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const searchTerm = 'lady gaga';

//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm, $options: 'i' };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//GET BY ID
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const searchId = '111111111111111111111108';

//     return Note.findById(searchId);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

  //CREATE A DOCUMENT
//   mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const newNote = {
//           title: "bob",
//           content: "more bob"
//       };

//     return Note.create(newNote);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// UPDATE NOTE BY ID
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
.then(() => {
    const updateId = '5c350c1497232448f3f52617';
  const newData = {
        title: "marvin",
        content: "more marvin, less bob"
    };

  return Note.findByIdAndUpdate(updateId, 
    newData,
    {upsert: true, new: true});
})
.then(results => {
  console.log(results);
})
.then(() => {
  return mongoose.disconnect()
})
.catch(err => {
  console.error(`ERROR: ${err.message}`);
  console.error(err);
});

