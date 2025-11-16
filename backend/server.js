import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/events", eventRoutes);

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
