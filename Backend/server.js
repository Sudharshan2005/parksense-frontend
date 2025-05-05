import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import axios from "axios";
import path from "path";

import vehicleRoutes from './routes/vehicles.js';
import directionsRoute from './routes/directions.js';
import qrGenerate from "./routes/qrGenerate.js"
import feedback from "./routes/feedback.js"
import uploadRoutes from "./routes/upload.js"
import numberPlatesRouter from "./routes/numberplates.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors());
connectDB();

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/directions', directionsRoute);
app.use('/api/qr', qrGenerate);
app.use('/api/feedback', feedback);
app.use('/api/upload', uploadRoutes);
app.use('/api/numberplates', numberPlatesRouter);

app.listen(PORT, '0.0.0.0', () => {
    console.log("Parksense backend running on port", PORT);
  });