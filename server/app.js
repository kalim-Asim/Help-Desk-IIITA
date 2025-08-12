const express = require('express');
const app = express();
const cors = require('cors');
const path = require("path");
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require("./routes/complaintRoutes");
const personnelRoutes = require("./routes/personnelRoutes");
const chatRoutes = require("./routes/chatRoutes");
const http = require("http");
const server = http.createServer(app);
const {connectSocket} = require("./socket");
connectSocket(server);

dotenv.config();

app.use(cors({
  // origin: "http://localhost:5173",
  origin: "https://help-desk-iiita.vercel.app",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/users', userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/personnel", personnelRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
