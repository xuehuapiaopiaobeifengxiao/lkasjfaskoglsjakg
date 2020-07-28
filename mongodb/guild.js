const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    _id: {type: String, required: true},
    redirect: {type:String, required:false},
    spawndisabled: {type:Array, default: []},
    prefix: {type:String, required: false}
});

module.exports = mongoose.model('Guilds', productSchema);