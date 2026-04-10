import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();

// ✅ FIXED imports
import sendEmail from "./utils/email.js";
import fetch from "node-fetch";
import Vehicle from "./models/vehicle.js";

import cloudinary from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import UserVerification from "./models/userverification.js";
import Rating from "./models/Rating.js";

// cloudinary v2
const { v2: cloudinaryV2 } = cloudinary;

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gla-gla/avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const verificationStorage = new CloudinaryStorage({
  cloudinary: cloudinaryV2,  // ✅
  params: {
    folder: "gla-gla/verifications",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const verificationUpload = multer({
  storage: verificationStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

const upload = multer({ storage });

async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "gla-gla-app" },
  });
  const data = await res.json();

  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}

async function getRouteDistanceKm(from, to) {
  const url = `http://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || !data.routes.length) return null;

  return (data.routes[0].distance / 1000).toFixed(1); // km
}

import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

async function sendNotification(pushToken, title, body) {
  try {
    

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
      }),
    });

    const data = await response.json();

    console.log("📡 EXPO RESPONSE:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("❌ Push error:", err.message);
  }
}

async function sendBatchNotification(tokens, title, body) {
  const messages = tokens.map((token) => ({
    to: token,
    title,
    body,
    sound: "default",
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(messages),
  });

  const data = await response.json();
  return data;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other","male", "female"],
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["driver", "passenger", "admin"],
    default: "passenger",
  },
  avatar: {
    type: String,
    default: "",
  },

  avgDriverRating: { type: Number, default: 0 },
totalDriverRatings: { type: Number, default: 0 },

avgPassengerRating: { type: Number, default: 0 },
totalPassengerRatings: { type: Number, default: 0 },

  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },

  pushToken: {
    type: String,
    default: "",
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },

  emailCode: {
    type: String,
    default: null,
  },

  emailCodeExpires: {
    type: Date,
    default: null,
  },

  resetCode: {
    type: String,
    default: null,
  },

  resetCodeExpires: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("User", UserSchema);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Ride Share Backend Running 🚗");
});

app.use(cors());
app.use(express.json());
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const RideSchema = new mongoose.Schema(
  {
    from: String,
    to: String,

    fromLat: Number,
    fromLng: Number,
    toLat: Number,
    toLng: Number,

    distanceKm: Number,

    departureTime: {
      type: Date,
      required: true,
    },

    arrivalTime: {
      type: Date,
      required: true,
    },

    price: Number,

    seats: {
      type: Number,
      required: true,
    },

    bookedSeats: {
      type: Number,
      default: 0,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },
vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true
  },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Ride = mongoose.model("Ride", RideSchema);

const BookingSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seatsBooked: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending",
  },
  driverReason: {
    type: String,
    default: "",
  },
  passengerReason: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model("Booking", BookingSchema);

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("🔐 AUTH HEADER:", authHeader);

  if (!authHeader) {
    console.log("❌ NO AUTH HEADER");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔑 TOKEN:", token);

  if (!token) {
    console.log("❌ TOKEN FORMAT INVALID");
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ DECODED:", decoded);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log("🔥 JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}



app.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

app.put("/me", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {


    const { name, age, gender } = req.body;

    const updates = {
      name,
      age,
      gender,
    };

    if (req.file) {
      updates.avatar = req.file.path; // cloudinary url
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    console.log("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/save-token", authMiddleware, async (req, res) => {
  try {
    
    console.log("🔥 /save-token HIT");
console.log("📦 BODY:", req.body);
    const { token } = req.body;

    const userId = req.userId; // from middleware

    await User.findByIdAndUpdate(userId, {
      pushToken: token,
    });

    const updatedUser = await User.findByIdAndUpdate(
  userId,
  { pushToken: token },
  { new: true }
);

console.log("💾 SAVED TOKEN:", updatedUser.pushToken);

    res.json({ message: "Push token saved" });
  } catch (error) {
    console.error("SAVE TOKEN ERROR:", error);
    res.status(500).send("Error saving token");
  }
});

const adminMiddleware = async (req, res, next) => {
  try {
    console.log("ADMIN CHECK USER ID:", req.userId);

    const user = await User.findById(req.userId);

    console.log("ADMIN CHECK USER:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Admin check failed" });
  }
};



const uploadAny = multer({ storage: verificationStorage });

app.post(
  "/api/verification/upload",
  authMiddleware,
  uploadAny.any(), // 👈 CHANGE HERE
  async (req, res) => {
    try {
      console.log("🔥 VERIFICATION HIT");
      console.log("📦 FILES:", req.files);

      const userId = req.userId;

      if (!req.files || req.files.length < 2) {
        return res.status(400).json({
          message: "Both files required",
        });
      }

      // extract files manually
      const licenseFile = req.files.find(f => f.fieldname === "license");
      const selfieFile = req.files.find(f => f.fieldname === "selfie");

      console.log("📄 LICENSE:", licenseFile);
      console.log("🤳 SELFIE:", selfieFile);

      if (!licenseFile || !selfieFile) {
        return res.status(400).json({
          message: "License and selfie required",
        });
      }

      const verification = new UserVerification({
        userId,
        licenseUrl: licenseFile.path,
        selfieUrl: selfieFile.path,
        status: "pending",
      });

      await verification.save();

      res.json({ message: "Verification uploaded successfully" });
    } catch (err) {
      console.error("🔥 FULL ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// passenger sees their own bookings
app.get("/my-bookings", authMiddleware, async (req, res) => {
  const bookings = await Booking.find({
    passengerId: req.userId,
  })
    .sort({ createdAt: -1 }) // 🔥 newest bookings first
    .populate({
      path: "rideId",
      populate: {
        path: "createdBy",
        select: "name age gender phone",
      },
    });

  res.json(bookings);
});

// driver sees all rides they posted
app.get("/my-rides", authMiddleware, async (req, res) => {
  const rides = await Ride.find({ createdBy: req.userId }).sort({
    createdAt: -1,
  });
  res.json(rides);
});

app.get("/bookings/:bookingId/driver", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate({
      path: "rideId",
      populate: {
        path: "createdBy",
        select: "name age gender phone",
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only passenger can view driver
    if (booking.passengerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const driver = booking.rideId.createdBy;

    // BEFORE ACCEPT → hide phone
    if (booking.status !== "accepted") {
      return res.json({
        name: driver.name,
        age: driver.age,
        gender: driver.gender,
        vehicleModel: booking.rideId.vehicleId.model,
vehicleNumber: booking.rideId.vehicleId.number,
      });
    }

    // AFTER ACCEPT → show phone
    res.json({
      name: driver.name,
      age: driver.age,
      gender: driver.gender,
      phone: driver.phone,
      vehicleModel: booking.rideId.vehicleId.model,
vehicleNumber: booking.rideId.vehicleId.number,
    });
  } catch (err) {
    console.error("VIEW DRIVER API ERROR:", err);
    res.status(500).json({ message: "Failed to load driver details" });
  }
});

// test route
app.get("/", (req, res) => {
  res.send("Ride Share Backend Running 🚗");
});

// get all rides
app.get("/rides", async (req, res) => {
  console.log("🔥 FILTERED RIDES ROUTE HIT");
  try {
    const rides = await Ride.find({
  departureTime: { $gt: new Date() },
  isCancelled: false,
})
  .populate("vehicleId")
  .populate("createdBy", "name avatar verificationStatus")
  .sort({ departureTime: 1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rides" });
  }
});

app.get("/rides/search", async (req, res) => {
  console.log("🔥 SEARCH ROUTE HIT");
  
  try {
    const { fromLat, fromLng, toLat, toLng, date } = req.query;
if (!fromLat || !fromLng || !toLat || !toLng || !date) {
  return res.status(400).json({
    message: "coordinates and date are required",
  });
}

    const selectedDate = new Date(date);

    if (isNaN(selectedDate)) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    // Start & end of selected day
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();

    let timeFilter;

    // If selected date is today → only future time
    if (startOfDay.toDateString() === now.toDateString()) {
      timeFilter = { $gte: now, $lte: endOfDay };
    } else {
      timeFilter = { $gte: startOfDay, $lte: endOfDay };
    }

    const rides = await Ride.find({
      isCancelled: false,
      departureTime: timeFilter,
    })
      .populate("createdBy", "name avatar verificationStatus")
      .populate("vehicleId")
      .sort({ departureTime: 1 });

      const MAX_DISTANCE_KM = 15;

const filteredRides = rides.filter((ride) => {
  const fromMatch =
    getDistanceKm(
      Number(fromLat),
      Number(fromLng),
      ride.fromLat,
      ride.fromLng
    ) <= MAX_DISTANCE_KM;

  const toMatch =
    getDistanceKm(
      Number(toLat),
      Number(toLng),
      ride.toLat,
      ride.toLng
    ) <= MAX_DISTANCE_KM;

  return fromMatch && toMatch;
});

    res.json(filteredRides);
  } catch (err) {
    console.error("SEARCH ERROR FULL:", err);
    res.status(500).json({ message: err.message });
  }
});


app.get("/rides/:rideId/bookings", authMiddleware, async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  // only driver can view passengers
  if (ride.createdBy.toString() !== req.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const bookings = await Booking.find({ rideId: ride._id }).populate(
    "passengerId",
    "name age gender phone",
  );

  res.json(bookings);
});

// get single ride by id
app.get("/rides/:id", async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate(
      "createdBy",
      "name age gender avatar",)
    .populate("vehicleId");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);
  } catch (err) {
    console.error("GET /rides/:id ERROR:", err);
    res.status(500).json({ message: "Failed to load ride" });
  }
});

// passenger can preview driver details (before acceptance)
app.get("/rides/:id/driver-preview", authMiddleware, async (req, res) => {
  const ride = await Ride.findById(req.params.id).populate(
    "createdBy",
    "name age gender",)
  .populate("vehicleId");;

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  res.json({
    name: ride.createdBy.name,
    age: ride.createdBy.age,
    gender: ride.createdBy.gender,
    vehicleModel: ride.vehicleId.model,
vehicleNumber: ride.vehicleId.number,
  });
});

// driver can see who booked their ride

app.get("/rides/:rideId/driver", authMiddleware, async (req, res) => {
  const booking = await Booking.findOne({
    rideId: req.params.rideId,
    passengerId: req.userId,
    status: "accepted", // 👈 THIS IS THE FIX
  }).populate({
    path: "rideId",
    populate: {
      path: "createdBy",
      select: "name age gender phone",
    },
  });

  if (!booking) {
    return res.status(403).json({
      message:
        "Driver details available only after driver accepts your booking",
    });
  }

  const driver = booking.rideId.createdBy;

  res.json({
    name: driver.name,
    age: driver.age,
    gender: driver.gender,
    phone: driver.phone,
    vehicleModel: booking.rideId.vehicleId.model,
vehicleNumber: booking.rideId.vehicleId.number,
  });
});

// driver accepts or rejects a booking
app.patch("/bookings/:bookingId/decision", authMiddleware, async (req, res) => {
  const { action, reason } = req.body; // accepted / rejected

  if (!["accepted", "rejected"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  if (action === "rejected" && (!reason || reason.length < 5)) {
    return res.status(400).json({ message: "Rejection reason required" });
  }

  const booking = await Booking.findById(req.params.bookingId).populate(
    "rideId",
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.rideId.createdBy.toString() !== req.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // 🔁 Idempotency: if already in this state, do nothing
  if (booking.status !== "pending" && action === "accepted") {
    return res.status(400).json({ message: "Booking already processed" });
  }

  // ✅ If accepting for the first time → reduce seats
  if (action === "accepted" && booking.status === "pending") {
    const ride = await Ride.findOneAndUpdate(
      { _id: booking.rideId._id, seats: { $gte: booking.seatsBooked } },
      { $inc: { seats: -booking.seatsBooked } },
      { new: true },
    );

    if (!ride) {
      return res.status(400).json({ message: "Not enough seats left" });
    }
  }

  // 🔁 If rejecting AFTER accepted → rollback seats
  if (action === "rejected" && booking.status === "accepted") {
    await Ride.findByIdAndUpdate(booking.rideId._id, {
      $inc: { seats: booking.seatsBooked },
    });
  }

  booking.status = action;

  if (action === "rejected") {
    booking.driverReason = reason;
  }

  booking.status = action;

  if (action === "rejected") {
    booking.driverReason = reason;
  }

  await booking.save();

  // 🔔 Notify passenger
  const passenger = await User.findById(booking.passengerId);

  if (passenger?.pushToken) {
    if (action === "accepted") {
      await sendNotification(
        passenger.pushToken,
        "✅ Booking Accepted",
        "Your seat has been confirmed for the ride.",
      );
    }

    if (action === "rejected") {
      await sendNotification(
        passenger.pushToken,
        "❌ Booking Rejected",
        reason || "Driver declined your booking request.",
      );
    }
  }

  res.json({ message: `Booking ${action}`, booking });
});

app.patch("/bookings/:bookingId/cancel", authMiddleware, async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.bookingId).populate(
    "rideId",
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.passengerId.toString() !== req.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (booking.status === "cancelled") {
    return res.status(400).json({ message: "Already cancelled" });
  }

  // 🔁 Return seats ONLY if booking was accepted
  if (booking.status === "accepted") {
    await Ride.findByIdAndUpdate(booking.rideId._id, {
      $inc: { seats: booking.seatsBooked },
    });
  }

  booking.status = "cancelled";
  booking.cancelReason = reason || "No reason given";
  await booking.save();

  
const ride = await Ride.findById(booking.rideId);
const driver = await User.findById(ride.createdBy);
if (driver?.pushToken) {
  await sendNotification(
    driver.pushToken,
    "🚫 Booking Cancelled",
    `A passenger cancelled their booking. ${booking.seatsBooked} seat(s) are now free.`
  );
}

  res.json({ message: "Booking cancelled successfully", booking });
});

app.patch("/rides/:id/book", authMiddleware, async (req, res) => {
  try {
    const { seats } = req.body;

    if (!seats || seats <= 0) {
      return res.status(400).json({ message: "Invalid seat count" });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.createdBy.toString() === req.userId) {
      return res.status(400).json({ message: "You cannot book your own ride" });
    }

    if (ride.seats < seats) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    let booking = await Booking.findOne({
      rideId: ride._id,
      passengerId: req.userId,
    });

    if (booking) {
      // Optional: prevent stacking multiple pending requests
      return res
        .status(400)
        .json({ message: "You already requested this ride" });
    }

    booking = await Booking.create({
      rideId: ride._id,
      passengerId: req.userId,
      seatsBooked: seats,
      status: "pending",
    });

    const driver = await User.findById(ride.createdBy);

    if (driver?.pushToken) {
      await sendNotification(
        driver.pushToken,
        "📩 Booking Request",
        "A passenger requested to join your ride",
      );
    }

    res.json({
      message: "Booking request sent",
      booking,
      seatsLeft: ride.seats, // still same, no decrement yet
    });
  } catch (err) {
    console.error("Book ride error:", err);
    res.status(500).json({ message: "Booking failed" });
  }
});

app.post("/ratings", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId, rating, review } = req.body;

   
    // 1. Validate input
    if (!bookingId || !rating) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "Missing fields" });
    }

    if (rating < 1 || rating > 5) {
      console.log("❌ Invalid rating value:", rating);
      return res.status(400).json({ message: "Invalid rating value" });
    }

    // 2. Get booking
    const booking = await Booking.findById(bookingId);
    console.log("📦 Booking:", booking);

    if (!booking) {
      console.log("❌ Booking not found");
      return res.status(404).json({ message: "Booking not found" });
    }

    // 3. Check ownership
    if (booking.passengerId.toString() !== userId) {
      console.log("❌ Not your booking");
      return res.status(403).json({ message: "Not your booking" });
    }

    // 4. Check status
    console.log("📌 Booking status:", booking.status);

    //if (booking.status !== "completed") {
      //console.log("❌ Invalid booking status");
     // return res.status(400).json({ message: "Invalid booking status" });
    //}

    // 5. Get ride
    const ride = await Ride.findById(booking.rideId);
    console.log("🚗 Ride:", ride);

    if (!ride) {
      console.log("❌ Ride not found");
      return res.status(404).json({ message: "Ride not found" });
    }

    // 6. Check ride completion (time)
    const now = new Date();
    console.log("⏱ Now:", now);
    console.log("⏱ Arrival:", ride.arrivalTime);

    if (new Date(ride.arrivalTime) > now) {
      console.log("❌ Ride not completed yet");
      return res.status(400).json({ message: "Ride not completed yet" });
    }

    // 7. Prevent duplicate
    const existing = await Rating.findOne({
      bookingId,
      fromUserId: userId,
    });

    if (existing) {
      console.log("❌ Already rated");
      return res.status(400).json({ message: "Already rated" });
    }

    // 8. Create rating
    const newRating = await Rating.create({
      bookingId,
      rideId: ride._id,
      fromUserId: userId,
      toUserId: ride.createdBy,
      role: "passenger_to_driver",
      rating,
      review,
    });

    console.log("✅ Rating created:", newRating._id);

    // 9. Update driver stats
    const driver = await User.findById(ride.createdBy);

    if (!driver) {
      console.log("❌ Driver not found");
      return res.status(404).json({ message: "Driver not found" });
    }

    const oldCount = driver.totalDriverRatings || 0;
    const oldAvg = driver.avgDriverRating || 0;
    const newCount = oldCount + 1;

    driver.avgDriverRating =
      (oldAvg * oldCount + rating) / newCount;

    driver.totalDriverRatings = newCount;

    await driver.save();

    console.log("✅ Driver stats updated:", {
      avg: driver.avgDriverRating,
      total: driver.totalDriverRatings,
    });

    return res.json({
      message: "Driver rated successfully",
      data: newRating,
    });

  } catch (err) {
    console.error("🔥 RATING ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

app.post("/ratings/passenger", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // driver
    const { bookingId, rating, review } = req.body;

    console.log("👉 /ratings/passenger HIT");
    console.log("USER (driver):", userId);
    console.log("BODY:", { bookingId, rating, review });

    // 1. Validate input
    if (!bookingId || !rating) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "Missing fields" });
    }

    if (rating < 1 || rating > 5) {
      console.log("❌ Invalid rating value:", rating);
      return res.status(400).json({ message: "Invalid rating value" });
    }

    // 2. Get booking
    const booking = await Booking.findById(bookingId);
    console.log("📦 Booking:", booking);

    if (!booking) {
      console.log("❌ Booking not found");
      return res.status(404).json({ message: "Booking not found" });
    }

    // 3. Get ride
    const ride = await Ride.findById(booking.rideId);
    console.log("🚗 Ride:", ride);

    if (!ride) {
      console.log("❌ Ride not found");
      return res.status(404).json({ message: "Ride not found" });
    }

    // 4. Check driver ownership
    if (ride.createdBy.toString() !== userId) {
      console.log("❌ Not your ride");
      return res.status(403).json({ message: "Not your ride" });
    }

    // 5. Check booking status
    console.log("📌 Booking status:", booking.status);

    //if (booking.status !== "completed") {
      //console.log("❌ Invalid booking status");
      //return res.status(400).json({ message: "Invalid booking status" });
    //}

    // 6. Check ride completion (time)
    const now = new Date();
    console.log("⏱ Now:", now);
    console.log("⏱ Arrival:", ride.arrivalTime);

    if (new Date(ride.arrivalTime) > now) {
      console.log("❌ Ride not completed yet");
      return res.status(400).json({ message: "Ride not completed yet" });
    }

    // 7. Prevent duplicate
    const existing = await Rating.findOne({
      bookingId,
      fromUserId: userId,
    });

    if (existing) {
      console.log("❌ Already rated");
      return res.status(400).json({ message: "Already rated" });
    }

    // 8. Create rating
    const newRating = await Rating.create({
      bookingId,
      rideId: ride._id,
      fromUserId: userId,
      toUserId: booking.passengerId,
      role: "driver_to_passenger",
      rating,
      review,
    });

    console.log("✅ Rating created:", newRating._id);

    // 9. Update passenger stats
    const passenger = await User.findById(booking.passengerId);

    if (!passenger) {
      console.log("❌ Passenger not found");
      return res.status(404).json({ message: "Passenger not found" });
    }

    const oldCount = passenger.totalPassengerRatings || 0;
    const oldAvg = passenger.avgPassengerRating || 0;
    const newCount = oldCount + 1;

    passenger.avgPassengerRating =
      (oldAvg * oldCount + rating) / newCount;

    passenger.totalPassengerRatings = newCount;

    await passenger.save();

    console.log("✅ Passenger stats updated:", {
      avg: passenger.avgPassengerRating,
      total: passenger.totalPassengerRatings,
    });

    return res.json({
      message: "Passenger rated successfully",
      data: newRating,
    });

  } catch (err) {
    console.error("🔥 DRIVER RATING ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

app.get("/users/:userId/ratings", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    console.log("👉 GET /users/:userId/ratings HIT");
    console.log("USER ID:", userId);

    // 1. Validate user
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Build filter
    const filter = { toUserId: user._id };
    if (role) filter.role = role;

    console.log("🔍 Filter:", filter);

    // 3. Get ratings list
    const ratings = await Rating.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("fromUserId", "name avatar");

    console.log("⭐ Ratings count:", ratings.length);

    // 4. Calculate DRIVER rating (passenger → driver)
    const driverStats = await Rating.aggregate([
      {
        $match: {
          toUserId: user._id,
          role: "passenger_to_driver",
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. Calculate PASSENGER rating (driver → passenger)
    const passengerStats = await Rating.aggregate([
      {
        $match: {
          toUserId: user._id,
          role: "driver_to_passenger",
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 6. Final response
    const response = {
      avgDriverRating: driverStats[0]?.avg || 0,
      totalDriverRatings: driverStats[0]?.count || 0,

      avgPassengerRating: passengerStats[0]?.avg || 0,
      totalPassengerRatings: passengerStats[0]?.count || 0,

      ratings,
    };

    console.log("📤 Response:", response);

    return res.json(response);

  } catch (err) {
    console.error("🔥 GET RATINGS ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { name, age, gender, phone, email, password } = req.body;

    // Required fields
    if (!name || !age || !gender || !phone || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    // Age restriction
    if (Number(age) < 18) {
      return res.status(400).json({
        message: "You need to be at least 18 years old to sign up",
      });
    }

    // Indian phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit Indian phone number",
      });
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "That email doesn’t look right",
      });
    }

    // Password rule
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password should be at least 6 characters long",
      });
    }

    // Check existing user
    const existing = await User.findOne({ email });

    if (existing) {
      // If user exists but not verified → resend code
      if (!existing.emailVerified) {
        const code = generateCode();

        existing.emailCode = code;
        existing.emailCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await existing.save();

        try {
          await sendEmail(
            email,
            "GoToGo verification code",
            `Your GoToGo verification code is ${code}. It expires in 10 minutes.`,
          );
        } catch (err) {
          console.log("Email send failed:", err);
        }

        return res.json({
          message: "You already signed up. We’ve sent a new verification code—check your email.",
        });
      }

      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const code = generateCode();

    const user = new User({
      name,
      age,
      gender,
      phone,
      email,
      password: hashedPassword,
      emailCode: code,
      emailCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await user.save();

    // Send email (non-blocking)
    try {
      await sendEmail(
        email,
        "GoToGo verification code",
        `Your GoToGo verification code is ${code}. It expires in 10 minutes.`,
      );
    } catch (err) {
      console.log("Email send failed:", err);
    }

    res.json({
      message:
        "Account created. Check your email for the verification code (don’t forget to check spam).",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Something went wrong while signing up. Please try again.",
    });
  }
});



app.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.emailCode !== code) {
    return res.status(400).json({ message: "Invalid code" });
  }

  if (user.emailCodeExpires < new Date()) {
    return res.status(400).json({ message: "Code expired" });
  }

  user.emailVerified = true;
  user.emailCode = null;
  user.emailCodeExpires = null;

  await user.save();

  // ✅ generate token
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "180d" }
  );

  // ✅ send token
  res.json({
    message: "Email verified successfully",
    token,
  });
});

app.post("/resend-verification-code", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  // generate new code
  const code = generateCode();

  user.emailCode = code;
  user.emailCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmail(
    email,
    "GoToGo verification code",
    `Your new GoToGo verification code is ${code}. It expires in 10 minutes.`,
  );

  res.json({ message: "Verification code sent again" });
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const code = generateCode();

  user.resetCode = code;
  user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmail(
    email,
    "GoToGo password reset",
    `Your GoToGo password reset code is ${code}. It expires in 10 minutes.`,
  );

  res.json({ message: "Password reset code sent" });
});

app.post("/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.resetCode !== code) {
    return res.status(400).json({ message: "Invalid code" });
  }

  if (user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: "Code expired" });
  }

  res.json({ message: "Code verified" });
});

app.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.resetCode !== code) {
    return res.status(400).json({ message: "Invalid code" });
  }

  if (user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: "Code expired" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetCode = null;
  user.resetCodeExpires = null;

  await user.save();

  res.json({ message: "Password reset successful" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "No account found with this email",
    });
  }

  if (!user.emailVerified) {
    return res.status(403).json({
      message: "Please verify your email before logging in",
    });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({
      message: "Incorrect password. Try again",
    });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "180d" }
  );

  res.json({ token });
});

app.post("/check-user", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ exists: false });
  }

  const user = await User.findOne({ email });
  res.json({ exists: !!user });
});

// add a ride
app.post("/rides", authMiddleware, async (req, res) => {
  console.log("👉 POST /rides HIT");
  
  try {
    // 🔐 Check verification before allowing ride creation
    const latestVerification = await UserVerification.findOne({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    if (!latestVerification) {
      return res.status(403).json({
        message: "Upload license and selfie before posting ride",
      });
    }

    if (latestVerification.status === "rejected") {
      return res.status(403).json({
        message: `Verification rejected: ${latestVerification.rejectionReason}`,
      });
    }



    // If pending or approved → continue
    const {
      from,
      to,
      fromLat,
      fromLng,
      toLat,
      toLng,

      departureTime,
      arrivalTime,
      seats,
      price,
      vehicleId,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);

if (!vehicle || vehicle.userId.toString() !== req.userId) {
  return res.status(400).json({ message: "Invalid vehicle" });
}

    // 🔒 Validate coords (this prevents NaN map crashes later)
    if (
      typeof fromLat !== "number" ||
      typeof fromLng !== "number" ||
      typeof toLat !== "number" ||
      typeof toLng !== "number"
    ) {
      return res.status(400).json({
        message: "Invalid coordinates. fromLat/fromLng/toLat/toLng required.",
      });
    }

    // 📏 Calculate distance using OSRM
    let distanceKm = null;
    try {
      distanceKm = await getDistanceKm(
        { lat: fromLat, lon: fromLng },
        { lat: toLat, lon: toLng },
      );
    } catch (err) {
      console.error("Distance calc failed:", err.message);
    }

    const ride = new Ride({
      from,
      to,
      fromLat,
      fromLng,
      toLat,
      toLng,
      distanceKm: distanceKm ? Number(distanceKm) : null,
      departureTime,
      arrivalTime,
      seats,
      price,
      vehicleId,
      createdBy: req.userId,
    });

    await ride.save();

    // Get user who created ride
    const user = await User.findById(req.userId);
    

    // Send notification
    if (user?.pushToken) {
      await sendNotification(
        user.pushToken,
        "🚗 Ride Posted",
        "Your ride has been posted successfully, it is visible for all passengers.",
      );
    }

    res.json({ message: "Ride added", ride });
  } catch (err) {
    console.error("POST /rides ERROR:", err.message);
    res.status(400).json({
      message: "Failed to add ride",
      error: err.message,
    });
  }
});

app.delete("/rides/:id", async (req, res) => {
  await Ride.findByIdAndDelete(req.params.id);
  res.json({ message: "Ride deleted" });
});

app.get("/me/stats", authMiddleware, async (req, res) => {
  try {
    const ridesPosted = await Ride.countDocuments({
      createdBy: req.userId,
    });

    const ridesTaken = await Booking.countDocuments({
      passengerId: req.userId,
      status: { $in: ["accepted", "pending"] },
      // or only accepted if you want strict: status: "accepted"
    });

    res.json({
      ridesPosted,
      ridesTaken,
    });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

app.get("/admin/verifications", authMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.userId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const pendingVerifications = await UserVerification.find({
      status: "pending",
    }).populate("userId", "name email phone");

    res.json(pendingVerifications);
  } catch (err) {
    console.error("ADMIN FETCH ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/admin/verifications/:id", authMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.userId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, rejectionReason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const verification = await UserVerification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    verification.status = status;
    verification.reviewedBy = req.userId;
    verification.reviewedAt = new Date();

    if (status === "rejected") {
      verification.rejectionReason = rejectionReason || "Rejected by admin";

      // 🚨 Cancel ONLY future rides
      await Ride.updateMany(
        {
          createdBy: verification.userId,
          isCancelled: false,
          departureTime: { $gt: new Date() },
        },
        { isCancelled: true },
      );
    }

    await verification.save();

   

    res.json({ message: "Verification updated successfully" });
  } catch (err) {
    console.error("ADMIN UPDATE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/verification/status", authMiddleware, async (req, res) => {
  try {
    const latestVerification = await UserVerification.findOne({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    if (!latestVerification) {
      return res.json({ status: "none" });
    }

    res.json({
      status: latestVerification.status,
      rejectionReason: latestVerification.rejectionReason,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get(
  "/api/admin/verifications",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const verifications = await UserVerification.find({ status: "pending" })
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 });

      res.json(verifications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch verifications" });
    }
  },
);

app.patch(
  "/api/admin/verification/:id/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const verification = await UserVerification.findById(req.params.id);

      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }

      verification.status = "verified";
      verification.rejectionReason = undefined;

      await verification.save();

      res.json({ message: "Verification approved" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Approve failed" });
    }
  },
);

app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -emailCode -resetCode")
      .sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.post("/vehicles", authMiddleware, async (req, res) => {
  try {
    const { type, number, manufacturer, model } = req.body;

    const cleanNumber = number.toUpperCase().trim();
    const vehicleRegex = /^[A-Z0-9 ]+$/;

    if (!type || !cleanNumber || !manufacturer || !model) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!vehicleRegex.test(cleanNumber) || cleanNumber.length < 5) {
      return res.status(400).json({ message: "Invalid vehicle number" });
    }

    const vehicle = new Vehicle({
      userId: req.userId,
      type,
      manufacturer,
      model,
      number: cleanNumber,
    });

    await vehicle.save();

    res.status(201).json(vehicle);
  } catch (err) {
    console.log("❌ VEHICLE ERROR:", err); // 👈 ADD THIS
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/vehicles", authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.userId });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/vehicles/:id", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // 🔐 only delete your own vehicle
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ message: "Vehicle removed" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch(
  "/api/admin/verification/:id/reject",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Rejection reason required" });
      }

      const verification = await UserVerification.findById(req.params.id);

      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }

      verification.status = "rejected";
      verification.rejectionReason = reason;

      await verification.save();

const user = await User.findById(verification.userId);
if (user?.pushToken) {
  await sendNotification(
    user.pushToken,
    status === "verified" ? "✅ Verification Approved" : "❌ Verification Rejected",
    status === "verified"
      ? "You can now post rides on GoToGo!"
      : `Reason: ${rejectionReason}`
  );
}

      res.json({ message: "Verification rejected" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Reject failed" });
    }
  },
);





app.post("/admin/send-notification", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body required" });
    }

    // filter out empty/null tokens
    const users = await User.find({
      pushToken: { $exists: true, $ne: null, $ne: "" },
    });

    if (!users.length) {
      return res.json({ message: "No users with push tokens found" });
    }

    const tokens = users.map((u) => u.pushToken);

    console.log(`📡 Sending to ${tokens.length} users`);

    const data = await sendBatchNotification(tokens, title, body);

    // Expo returns array of receipts, one per token
    const receipts = data.data || [];
    const success = receipts.filter((r) => r.status === "ok").length;
    const failed = receipts.filter((r) => r.status === "error").length;

    console.log(`✅ Success: ${success} | ❌ Failed: ${failed}`);

    res.json({
      message: "Notifications sent",
      total: tokens.length,
      success,
      failed,
    });
  } catch (err) {
    console.error("BATCH NOTIFICATION ERROR:", err);
    res.status(500).json({ message: "Failed to send notifications" });
  }
});

app.get("/whoami", (req, res) => {
  res.send("LOCAL SERVER");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR FULL:", err);

  // 👇 VERY IMPORTANT (multer specific)
  if (err.name === "MulterError") {
    return res.status(400).json({
      message: "Multer error",
      error: err.message,
    });
  }

  if (err.message) {
    return res.status(500).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: "Unknown error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
