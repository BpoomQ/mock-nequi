const SHA2 = require('sha2')
const mongoose = require('mongoose')
const Schema = mongoose.Schema


const MattressSchema = new Schema({
  mattressBalance: Number
})

const PocketSchema = new Schema({
  name: String,
  pocketBalance: Number
})

const GoalSchema = new Schema({
  name: String,
  goalBalance: Number,
  currentBalance: Number,
  status: Boolean,
  goalDate: Date
})

const AccountSchema = new Schema({
  accountBalance: Number,
  mattress: MattressSchema,
  pockets: [PocketSchema],
  goals: [GoalSchema]
})

const UserSchema = new Schema({
  local:{
    name: String,
    lastName: String,
    email: String,
    password: String
  },
  account: AccountSchema
})

UserSchema.methods.hashingPassword = function(password){
  return SHA2.SHA256(password).toString('hex')
}

UserSchema.methods.validatePassword = function(password){
  password = SHA2.SHA256(password).toString('hex')
  return password == (this.local.password)
}

module.exports = mongoose.model('User',UserSchema)
