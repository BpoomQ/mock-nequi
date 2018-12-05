const mongoose = require('mongoose')
const Schema = mongoose.Schema
var ObjectId = mongoose.Schema.Types.ObjectId;

const TransferSchema = new Schema({
  sender: ObjectId,
  addressee: ObjectId,
  amount: Number
})

module.exports=mongoose.model('Transfers',TransferSchema)
