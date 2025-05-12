const mongoose = require('mongoose');

const inverterSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const batterySchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const costSchema = new mongoose.Schema({
  system: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true },
  
  // Panels Section
  totalWattsPerPanel: { type: Number, required: true },
  totalPanels: { type: Number, required: true },
  totalWatts: { type: Number, required: true },
  ratePerWatt: { type: Number, required: true },
  totalPanelsPrice: { type: Number, required: true },
  
  // Inverters Section
  inverters: [inverterSchema],
  totalInvertersPrice: { type: Number, required: true },
  
  // Batteries Section
  batteries: [batterySchema],
  totalBatteriesPrice: { type: Number, required: true },
  
  // Cables and Breakers Section
  cableDCPrice: { type: Number, required: true },
  cableACPrice: { type: Number, required: true },
  breakerDCPrice: { type: Number, required: true },
  breakerACPrice: { type: Number, required: true },
  
  // Battery Components Section
  breakerBatteryPrice: { type: Number, required: true },
  batteryCablePrice: { type: Number, required: true },
  luxBatteryPrice: { type: Number, required: true },
  
  // Infrastructure Section
  changeOverPrice: { type: Number, required: true },
  dbPrice: { type: Number, required: true },
  accessoriesPrice: { type: Number, required: true },
  transportationPrice: { type: Number, required: true },
  
  // Services and Frames Section
  serviceType: { type: String, enum: ['perWatt', 'total'], required: true },
  servicePerWattRate: { type: Number },
  serviceTotalPrice: { type: Number, required: true },
  
  framesType: { type: String, enum: ['perWatt', 'total'], required: true },
  framesPerWattRate: { type: Number },
  framesTotalPrice: { type: Number, required: true },
  
  // Additional Components Section
  netmeteringPrice: { type: Number, required: true },
  earthingPrice: { type: Number, required: true },
  loopersSPDPrice: { type: Number, required: true },
  
  // Profit Section
  profitPercentage: { type: Number, required: true },
  profitAmount: { type: Number, required: true },
  profitWithPercentage: { type: Number, required: true },
  profitWithAmount: { type: Number, required: true },
  
  // Final Price Section
  finalPriceWithPercentage: { type: Number, required: true },
  finalPriceWithAmount: { type: Number, required: true },
  selectedPriceType: { type: String, enum: ['percentage', 'amount'], required: true },
  finalPrice: { type: Number, required: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cost', costSchema); 