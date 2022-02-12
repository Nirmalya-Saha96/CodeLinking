const mongoose = require('mongoose');

const NominateSchema = new mongoose.Schema({
    seller:{
      type: String,
      required: true
    },
    account: {
      type: String,
      required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
      type: String,
      required: true
    },
    minBid: {
      type: Number,
      required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    currBid: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isStarted:{
      type: Boolean,
      default: false
    },
    startDate:{
      type: String,
      default: ""
    },
    isSold: {
      type: Boolean,
      default: false
    },
    userBought: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contractAddress: {
      type: String,
      default: ""
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = NominateProducts = mongoose.model('NominateProducts', NominateSchema);
