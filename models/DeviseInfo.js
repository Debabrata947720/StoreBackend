const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeviseInfoSchema = new Schema({
    deviseId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    useragent: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("DeviseInfo", DeviseInfoSchema);
