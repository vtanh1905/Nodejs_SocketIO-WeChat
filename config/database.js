var mongoose = require('mongoose');

const NAMEDATABASE  = 'learning_nodejs';
const PASSWORD      = 'scla123456';


mongoose.connect(`mongodb+srv://${NAMEDATABASE}:${PASSWORD}@cluster0-j6bib.gcp.mongodb.net/${NAMEDATABASE}?retryWrites=true&w=majority`, {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected");
});