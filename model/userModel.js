const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
// const retelimit 
let PASSWORD;
// deployed 
if (process.env.PASSWORD) {
    PASSWORD = process.env.PASSWORD;
} else {
    // local 
    PASSWORD = require("../secrets").PASSWORD;
}

const validator = require("email-validator");
let dbLink
    = `mongodb+srv://admin:${PASSWORD}@cluster0.3gwfq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
mongoose
    .connect(dbLink)
    .then(function (connection) {
        console.log("db has been conncetd")

    }).catch(function (error) {
        console.log("err", error);
    })
//mongoose -> data -> exact -> data -> that is required to form an entity 
//  data completness , data validation
// name ,email,password,confirmPassword-> min ,max,confirmPassword,required ,unique 
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: function () {
                // third party library 
                return validator.validate(this.email)
            }
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        }
        ,
        confirmPassword: {
            type: String,
            required: true,
            minlength: 8,
            validate: function () {
                return this.password == this.confirmPassword
            }
        },
        createdAt: {
            type: String,

        },
        token: String,
        validUpto: Date,
        role: {
            type: String,
            enum: ["admin", "ce", "user"],
            default: "user"
        },
        bookings: {
            //   array of object id 
            type: [mongoose.Schema.ObjectId],
            ref: "bookingModel"
        },
    })
// hook
userSchema.pre('save',async function (next) {
    // do stuff
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    this.confirmPassword = undefined;
    next();
});
// document method
userSchema.methods.resetHandler = async function (password, confirmPassword) {
    this.password = password;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    this.confirmPassword = confirmPassword;
    this.token = undefined;
}
// model
let userModel = mongoose.model("PABUserModel", userSchema);
module.exports = userModel;