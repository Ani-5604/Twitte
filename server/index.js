require("dotenv").config(); // Load environment variables
const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());
 const uri = "mongodb+srv://ganindita452:75aQLAE88CKyeORL@cluster0.iocju79.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" // MongoDB URI from environment variables
const port = process.env.PORT || 5000; // Default port 5000

const client = new MongoClient(uri);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "twitterlitepro@gmail.com",
  pass: "lgdejjphyzmfllag", // Make sure to use environment variables for sensitive data
}
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("database").collection("users");
    const postCollection = client.db("database").collection("posts");
    const otpCollection = client.db("database").collection("otps");
    app.get('/users', async (req, res) => {
      try {
        const users = await userCollection.find().toArray();

        res.json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    // Register User
    app.post("/register", async (req, res) => {
      const user = { ...req.body, followers: [], following: [] };
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Send OTP
    app.post("/send-otp", async (req, res) => {
      const { email } = req.body;

      // Check if user exists
      const user = await userCollection.findOne({ email });
      if (!user) return res.status(404).send({ message: "User not found" });

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

      // Save OTP
      await otpCollection.insertOne({
        email,
        otp,
        expirationTime,
        status: "active",
        createdAt: new Date(),
      });

      // Send OTP email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Verification",
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        res.send({ message: "OTP sent successfully" });
      } catch (error) {
        console.error("Error sending OTP email:", error);
        res.status(500).send({ message: "Failed to send OTP" });
      }
    });

    // Verify OTP
    app.post("/verify-otp", async (req, res) => {
      const { email, otp } = req.body;
      const otpRecord = await otpCollection.findOne({ email, otp, status: "active" });

      if (!otpRecord) {
        return res.status(400).send({ message: "Invalid or expired OTP" });
      }

      if (new Date() > new Date(otpRecord.expirationTime)) {
        await otpCollection.updateOne({ email, otp }, { $set: { status: "expired" } });
        return res.status(400).send({ message: "OTP has expired" });
      }

      // Mark OTP as used
      await otpCollection.updateOne({ email, otp }, { $set: { status: "used" } });
      res.send({ message: "OTP verified successfully" });
    });

    // Create a Post
    app.post("/post", async (req, res) => {
      const { email, content } = req.body;

      // Fetch user's followers count
      const user = await userCollection.findOne({ email });
      if (!user) return res.status(404).send({ message: "User not found" });

      const followerCount = user.followers.length;

      // Restrict posts if user has no followers except between 10:00-10:30 AM IST
      const istTime = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();

      if (followerCount === 0 && !(hours === 10 && minutes >= 0 && minutes <= 30)) {
        return res.status(403).send({
          message: "Users with no followers can only post between 10:00 AM and 10:30 AM IST",
        });
      }

      // Limit posts per day if followers < 2
      const postsToday = await postCollection
        .find({
          email,
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        })
        .count();

      if (followerCount < 2 && postsToday >= 1) {
        return res.status(403).send({ message: "Posting limit reached for today" });
      }

      // Save post
      const newPost = { email, content, createdAt: new Date() };
      await postCollection.insertOne(newPost);
      res.send({ message: "Post created successfully" });
    });

    // Get Posts
    app.get("/posts", async (req, res) => {
      const posts = await postCollection.find().sort({ createdAt: -1 }).toArray();
      res.send(posts);
    });

    // Follow User
    app.post("/follow", async (req, res) => {
      const { followerEmail, followingEmail } = req.body;

      if (followerEmail === followingEmail) {
        return res.status(400).send({ message: "You cannot follow yourself" });
      }

      await userCollection.updateOne(
        { email: followerEmail },
        { $addToSet: { following: followingEmail } }
      );
      await userCollection.updateOne(
        { email: followingEmail },
        { $addToSet: { followers: followerEmail } }
      );

      res.send({ message: "Followed successfully" });
    });

    // Unfollow User
    app.post("/unfollow", async (req, res) => {
      const { followerEmail, followingEmail } = req.body;

      await userCollection.updateOne(
        { email: followerEmail },
        { $pull: { following: followingEmail } }
      );
      await userCollection.updateOne(
        { email: followingEmail },
        { $pull: { followers: followerEmail } }
      );

      res.send({ message: "Unfollowed successfully" });
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

run().catch(console.error);

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
