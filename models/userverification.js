const mongoose = require("mongoose");

const UserVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    licenseUrl: {
      type: String,
      required: true,
    },
    selfieUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

UserVerificationSchema.post("save", async function (doc) {
  try {
    const User = mongoose.model("User");

    await User.findByIdAndUpdate(doc.userId, {
      verificationStatus: doc.status,
    });

    console.log("User synced with verification:", doc.userId, doc.status);
  } catch (err) {
    console.error("Sync error:", err.message);
  }
});


module.exports = mongoose.model("UserVerification", UserVerificationSchema);
