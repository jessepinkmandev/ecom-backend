const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    productId: {
      type: Schema.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("reviewProducts", reviewSchema);
