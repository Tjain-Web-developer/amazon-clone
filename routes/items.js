const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    itemName: String,
    itemPrice: Number,
    itemDes: String,
    itemImg: String,
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    qty: {
        type: Number,
        default: 1
    }
})

module.exports = mongoose.model('item',itemSchema)