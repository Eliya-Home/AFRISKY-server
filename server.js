import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/flights", (req, res) => {

    const { from, to } = req.query;

    let flights = [
        { name:"Air Tanzania", from:"Dar", to:"Nairobi", price:150000, time:"2h" },
        { name:"Kenya Airways", from:"Dar", to:"Nairobi", price:180000, time:"1h 45m" },
        { name:"RwandAir", from:"Kigali", to:"Nairobi", price:120000, time:"1h" }
    ];

    let result = flights.filter(f =>
        (!from || f.from.toLowerCase().includes(from.toLowerCase())) &&
        (!to || f.to.toLowerCase().includes(to.toLowerCase()))
    );

    res.json(result);
});

app.listen(3000, () => console.log("Server running"));