const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/Like-city')
mongoose.Types.ObjectId.isValid('your id here');

const citySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    lat:{
        type: Number,
        required: true
    },
    lon:{
        type: Number,
        required: true
    }
},{
    timestamps: true
})

const CityModel = mongoose.model('City', citySchema)

module.exports = CityModel
