const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    _id: {type: String, required: true},
    id: {type: String, required: true},
    name: {type: String, required: true},
    level: {type: Number, required:true},
    hp: {type: Number, required: true},
    atk: {type: Number, required: true},
    def: {type: Number, required: true},
    spatk: {type: Number, required: true},
    spdef: {type: Number, required: true},
    speed: {type: Number, required: true},
    total: {type: Number, required: true},
    author: {type:String, required: true},
    price: {type:String, required: true}
});

module.exports = mongoose.model('Markets', productSchema);