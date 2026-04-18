import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// 🔗 CONNECT DATABASE
mongoose.connect("WEKA_MONGODB_URL")
.then(()=>console.log("✅ MongoDB connected"))
.catch(err=>console.log(err));

// ===============================
// 👤 USER MODEL
const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String,
    role: String
});

// ===============================
// 🔐 REGISTER
app.post("/api/register", async (req, res) => {

    const { name, email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed, role });

    await user.save();

    res.json({ message: "User created" });
});

// ===============================
// 🔑 LOGIN
app.post("/api/login", async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) return res.json({ error: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secret");

    res.json({
        token,
        role: user.role,
        name: user.name
    });
});

// ===============================
// ✈️ FLIGHTS (UNCHANGED)
app.get("/api/flights", async (req, res) => {

    try {

        const { from, to } = req.query;

        const response = await axios.get(
            "https://test.api.amadeus.com/v2/shopping/flight-offers",
            {
                headers: { Authorization: "Bearer YOUR_TOKEN" },
                params: {
                    originLocationCode: from || "DAR",
                    destinationLocationCode: to || "NBO",
                    departureDate: "2026-05-01",
                    adults: 1
                }
            }
        );

        let flights = response.data.data.map(f => {

            let s = f.itineraries[0].segments[0];

            return {
                name: f.validatingAirlineCodes[0],
                from: s.departure.iataCode,
                to: s.arrival.iataCode,
                price: parseInt(f.price.total * 2500),
                time: s.duration
            };
        });

        res.json(flights);

    } catch {
        res.json([]);
    }
});

// ===============================
app.listen(3000, () => console.log("✅ SERVER RUNNING"));