var mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/n15")

var userSchema = mongoose.Schema({
  username: String,
  age: Number,
  password:String,
  posts:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"post"
    }
  ],
  email : String,
  image:{
    type:String,
    default:"def.png"
  },
  key:String
})
userSchema.plugin(plm);
module.exports = mongoose.model("user",userSchema)