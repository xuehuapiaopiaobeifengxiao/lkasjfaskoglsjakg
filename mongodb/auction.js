const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
  _id: { type: String, required: true },
  author: { type: String, required: true },
  pokemon: { type: Object, required: true },
  bid: { type: Object, required: true },
  insta: { type: Number, required: false },
  endsAt: { type: String, required: true },
});

module.exports = mongoose.model("Auctions", productSchema);
