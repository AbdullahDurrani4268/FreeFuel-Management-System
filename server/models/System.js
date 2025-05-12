const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    systemSize: { type: String, required: true },
    systemType: { type: String, enum: ['onGrid', 'offGrid', 'Hybrid'], required: true, unique: true },
    systemLocation: { type: String, required: true },
});

module.exports = mongoose.model('System', systemSchema);