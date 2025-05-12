const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const costsRouter = require('./routes/costs');
const clientsRouter = require('./routes/clients');
const tasksRouter = require('./routes/tasks');
const http = require('http');
const { setSocketIO } = require('./routes/tasks');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
setSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/freefuel';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Seed initial admin user if not exists
async function seedAdmin() {
  try {
    const adminEmail = 'abdullahkhandurrani4268@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin@001954', 10);
      const admin = new User({
        username: 'durrani',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('Initial admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
}

mongoose.connection.once('open', seedAdmin);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/api/costs', costsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/tasks', tasksRouter); 