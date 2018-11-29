const mongoose = require('mongoose')
const SHA2 = require('sha2')

const userSchema = new  mongoose.Schema({
  local:{
    name: String,
    lastName: String,
    email: String,
    password: String
  },
})

userSchema.methods.hashingPassword = function(password){
  return SHA2.SHA256(password).toString('hex')
}

userSchema.methods.validatePassword = function(password){
  password = SHA2.SHA256(password).toString('hex')
  return password.equals(this.password)
}

module.exports = mongoose.model('User',userSchema)
