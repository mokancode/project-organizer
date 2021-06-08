const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const NoteSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    // displayName: {
    //     type: String,
    //     required: true
    // },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String
    },
    date: {
        type: String,
        default: Date.now()
    },
})

module.exports = Note = mongoose.model('users', NoteSchema);