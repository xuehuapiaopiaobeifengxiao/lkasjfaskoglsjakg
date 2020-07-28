const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    _id: {type: String, required: true},
    pokemons: {type:Array, default:[]},
    balance: {type:Number, default:0},
    claimed: {type: Array, default:[]},
    redeems: {type:Number, required:false},
    donated: {type:Number, required:false},
    selected: {type:Number, required:false},
    lastdaily: {type:Number, required:false},
});

module.exports = mongoose.model('Users', productSchema);
