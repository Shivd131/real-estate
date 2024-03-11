import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
export const test = (req, res) => {
  res.json({
    message: "Hello World",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account!"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User has been deleted..." });
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Parse page from query parameters or default to 1
  const perPage = 5; // Number of listings per page

  if (req.user.id === req.params.id) {
    try {
      const totalListings = await Listing.countDocuments({ userRef: req.params.id });
      const totalPages = Math.ceil(totalListings / perPage);

      const listings = await Listing.find({ userRef: req.params.id })
        .skip((page - 1) * perPage) // Skip documents based on the current page
        .limit(perPage); // Limit documents per page

      res.status(200).json({ listings, totalPages });
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

