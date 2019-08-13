const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: String,
    role: {type: String, enum: ['candidate', 'interviewer']},
    availability: Array,
})

const User = mongoose.model('User', userSchema)
module.exports = User