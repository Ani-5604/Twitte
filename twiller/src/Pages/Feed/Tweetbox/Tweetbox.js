import React, { useState, useRef } from "react";
import "./Tweetbox.css";
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam"; // Video Icon
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import { useTranslation } from "react-i18next";

const Tweetbox = () => {
  const [post, setPost] = useState("");
  const [imageurl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); // Added state for video
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [name, setName] = useState("");
  const { user } = useUserAuth();
  const [loggedinUser] = useLoggedinuser();
  const email = user?.email;
  const userProfilePic = loggedinUser[0]?.profileImage || user?.photoURL;
  const audioRef = useRef(null);
  const videoRef = useRef(null); // Ref for video player
  const [username, setusername] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredOtp, setEnteredOtp] = useState(""); // New state for OTP input
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { t } =useTranslation(); // Access the translation function
  const startRecording = () => {
    
    // Check posting restrictions
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    const currentTime = currentHour + currentMinutes / 60;
   
    const isAllowedTime = currentTime >= 14 && currentTime <= 19;
    if (!isAllowedTime) {
      toast.error("You can only upload audio between 2 PM and 7 PM IST.");
      return false;
    }
    toast.info("Please Verify Email First!");
    if (!isRecording) {
      if (!otpVerified) {
        setShowEmailForm(true);
        return;
      }
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          const chunks = [];
          mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
          };
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "audio/wav" });
            setAudioBlob(blob);
            const audioUrl = URL.createObjectURL(blob);
            setAudioUrl(audioUrl);
          };
          mediaRecorder.start();
          setIsRecording(true);
          audioRef.current = mediaRecorder;
        })
        .catch((error) => {
          toast.error("Unable to access the microphone.");
        });
    } else {
      audioRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUploadImage = (e) => {
    setIsLoading(true);
    const image = e.target.files[0];
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post(
        "https://api.imgbb.com/1/upload?key=b0ea2f6cc0f276633b2a8a86d2c43335",
        formData
      )
      .then((res) => {
        setImageUrl(res.data.data.display_url);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const handleUploadVideo = (e) => {
    const videoFile = e.target.files[0];
    if (videoFile) {
      setIsLoading(true); // Set loading state to true while uploading

      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("upload_preset", "bdigpxny"); // Your Cloudinary upload preset
      formData.append("folder", "video_uploads"); // Optional: Specify the folder for organizing uploads

      // Cloudinary upload API call
      axios
        .post(
          "https://api.cloudinary.com/v1_1/your_cloud_name/video/upload",
          formData
        )
        .then((response) => {
          setVideoUrl(response.data.secure_url); // Video URL returned by Cloudinary
          setIsLoading(false); // Stop the loading state once the video is uploaded
        })
        .catch((error) => {
          console.error("Error uploading video:", error);
          setIsLoading(false);
        });
    }
  };

  const handlePost = (e) => {
    e.preventDefault();

    const currentFollowerCount = loggedinUser[0]?.following.length || 0;
console.log(currentFollowerCount);
    // Check posting restrictions
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    const currentTime = currentHour + currentMinutes / 60;
    console.log("Logged-in User:", loggedinUser[0]);
    console.log("Following:", loggedinUser[0]?.following);
    console.log("Following Count:", loggedinUser[0]?.following?.length || 0);
    console.log("Followers:", loggedinUser[0]?.followers);
    console.log("Followers Count:", loggedinUser[0]?.followers?.length || 0);
    
    const isPostingTime =
      currentHour === 10 && currentMinutes >= 0 && currentMinutes <= 30;

    if (currentFollowerCount === 0 && !isPostingTime) {
      toast.warning(
        "You can only post between 10:00 AM and 10:30 AM IST if you have no followers."
      );
      return false;
    }
    if (currentFollowerCount > 0 && currentFollowerCount <= 10 && postCount >= 2) {
      toast.warning("You can only post up to 2 times a day.");
      return false;
    }
  

    const userPost = {
      profilephoto: userProfilePic,
      post: post,
      photo: imageurl,
      video: videoUrl,
      audio: audioUrl,
      username: username,
      name: name,
      email: email,
    };

    fetch("http://localhost:5000/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userPost),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setPost("");
        setImageUrl("");
        setAudioUrl("");
        setVideoUrl("");
        setPostCount(postCount + 1); // Update post count
      });
  };

  const handleEmailSubmit = () => {
    if (enteredEmail === email) {
      axios
        .post("http://localhost:5000/send-otp", { email: enteredEmail })
        .then((response) => {
          setOtpSent(true);
          toast.success("OTP sent to your email!");
        })
        .catch((error) => {
          toast.error("Error sending OTP.");
        });
    } else {
      toast.error("Email does not match the registered email.");
    }
  };

  const handleOtpVerify = () => {
    if (enteredOtp) {
      
      axios
        .post("http://localhost:5000/verify-otp", {
          otp: enteredOtp,
          email: enteredEmail,
 
        })
        .then((response) => {
          
          if (response.data.success) {
            console.log(response.data.success);
            setOtpVerified(true);
            setShowEmailForm(false);
            toast.success("OTP Verified!");
          } else {
            toast.error("Invalid OTP.");
          }
        })
        .catch((error) => {
          toast.error("Error verifying OTP.");
        });
    } else {
      toast.error("Please enter the OTP.");
    }
  };

  return (
    <div className="tweetBox">
      <form onSubmit={handlePost}>
        <div className="tweetBox__input">
          <Avatar src={userProfilePic} />
          <input
            type="text"
            placeholder={t("What's happening?")}
            onChange={(e) => setPost(e.target.value)}
            value={post}
            required
          />
        </div>
        <div className="imageIcon_tweetButton">
          <label htmlFor="image" className="imageIcon">
            {isLoading ? (
              <p>Uploading Image</p>
            ) : (
              <p>
                {imageurl ? "Image Uploaded" : <AddPhotoAlternateOutlinedIcon />}
              </p>
            )}
          </label>
          <input
            type="file"
            id="image"
            className="imageInput"
            onChange={handleUploadImage}
          />

          <label htmlFor="video" className="videoIcon">
            {isLoading ? (
              <p>Uploading Video</p>
            ) : (
              <p>{videoUrl ? "Video Uploaded" : <VideocamIcon />}</p>
            )}
          </label>
          <input
            type="file"
            id="video"
            className="videoInput"
            onChange={handleUploadVideo}
            accept="video/*"
          />

          <MicIcon
            onClick={startRecording}
            style={{ cursor: "pointer", marginLeft: "10px" }}
          />
          {audioUrl && <audio controls src={audioUrl}></audio>}
          <Button className="tweetBox__tweetButton" type="submit">
            Tweet
          </Button>
        </div>
          {/* Media Previews */}
          <div className="mediaPreview">
          {imageurl && (
            <div>
              <p>Image Preview:</p>
              <img src={imageurl} alt="uploaded-img" width="200px" />
            </div>
          )}
          {videoUrl && (
            <div>
              <p>Video Preview:</p>
              <video controls src={videoUrl} width="200px" />
            </div>
          )}
          {audioUrl && (
            <div>
              <p>Audio Preview:</p>
              <audio controls src={audioUrl} />
            </div>
          )}
        </div>
 
      </form>

      {showEmailForm && (
        <div className="emailOtpForm">
          {!otpSent ? (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={enteredEmail}
                onChange={(e) => setEnteredEmail(e.target.value)}
              />
              <Button onClick={handleEmailSubmit}>Submit</Button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP sent to your email"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
              />
              <Button onClick={handleOtpVerify}>Verify OTP</Button>
            </>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Tweetbox;
