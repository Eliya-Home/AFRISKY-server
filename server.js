import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());

// ================= DATABASE
mongoose.connect("WEKA_MONGODB_URL");

const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String,
    role: String
});

const Booking = mongoose.model("Booking", {
    user: String,
    route: String,
    seats: Array,
    total: Number,
    status: String
});

// ================= AUTH
app.post("/api/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);

    await new User({ name, email, password: hash, role }).save();

    res.json({ message: "Registered" });
});

app.post("/api/login", async (req, res) => {

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ error: "User not found" });

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.json({ error: "Wrong password" });

    res.json(user);
});

// ================= FLIGHTS (MOCK + REAL READY)
app.get("/api/flights", (req, res) => {

    res.json([
        { name:"Air Tanzania", from:"DAR", to:"NBO", price:150000, time:"2h" },
        { name:"Kenya Airways", from:"DAR", to:"NBO", price:180000, time:"1h 45m" }
    ]);
});

// ================= BOOKING
app.post("/api/book", async (req, res) => {

    const booking = new Booking({
        user: req.body.user,
        route: req.body.route,
        seats: req.body.seats,
        total: req.body.total,
        status: "PAID"
    });

    await booking.save();

    res.json({ message: "Booked", booking });
});

// ================= GET BOOKINGS
app.get("/api/bookings", async (req, res) => {
    const data = await Booking.find();
    res.json(data);
});

app.listen(3000, ()=>console.log("✅ SERVER RUNNING"));