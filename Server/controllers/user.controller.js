// controllers/userController.js
import bcrypt from "bcrypt"
 import User from "../models/User.js";
// controllers/userController.js
export const updateUserStatus = async (req, res) => {
  try {
    console.log("ID received:", req.params.id);
    console.log("Status received:", req.body.status);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).select("-password");

    console.log("Updated user:", user);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error:", err.message); // ✅ see exact error
    res.status(500).json({ message: "Failed to update status" });
  }
};

export const getusersAdmin = async (req,res)=>{
      try {
        const users = await User.find({role : { $ne : "superadmin"}}).select("-password").sort({createdAt :-1}); 
        res.json(users);
      } catch (err) {
        res.status(500).json({ message: "Failed to fetch users" });
      }
    
}

export const updateUser = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "null") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Admins cannot access profile editor
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot edit user profiles" });
    }

    // Users can only update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;

    if (currentPassword && newPassword) {
      if (user.password.startsWith("google_oauth_")) {
        return res.status(400).json({ message: "Google account — cannot change password here" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const updateAdminPassword = async (req, res) => {
  try {
    // Only admins can hit this route
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Admin can only update their own password
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Cannot update another admin's password" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin" || user.role === "superadmin") {
      return res.status(403).json({ message: "Cannot delete admin accounts" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};