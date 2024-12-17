import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import TwitterIcon from "@mui/icons-material/Twitter";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreIcon from "@mui/icons-material/More";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { Avatar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Modal from "react-modal";
import Sidebaroption from "./Sidebaroption";
import Customlink from "./Customlink";
import axios from "axios";
import useLoggedinuser from "../../hooks/useLoggedinuser";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "./sidebar.css";
import LanguageSelector from "../../LanguageSelector";

const Sidebar = ({ handlelogout, user }) => {
  const { i18n } = useTranslation(); // To switch languages using i18next
  const [anchorE1, setAnchorE1] = useState(null);
  const [loggedinUser] = useLoggedinuser();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpFormStep, setOtpFormStep] = useState(1); // Step 1: Email/Phone, Step 2: OTP
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [enteredEmail, setEnteredEmail] = useState(""); // User entered email
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { t } = useTranslation();
  const email = user?.email; // Registered email from the user

  const handleClick = (e) => {
    setAnchorE1(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorE1(null);
  };

  const result = user?.email?.split("@")[0];

  const [language, setLanguage] = useState("en");
  const handleLanguageChange = (lang) => setLanguage(lang);
  const handleSubmitEmailOrPhone = async () => {
    setLoading(true);
    setError(''); // Reset any error message

    if (language === 'fr') {
      // Compare enteredEmail with the registered email
      if (enteredEmail.trim().toLowerCase() === user?.email.trim().toLowerCase()) {
        try {
          const response = await axios.post("http://localhost:5000/send-otp", { email: enteredEmail });
          setOtpSent(true);
          toast.success("OTP sent to your email!");
          setOtpFormStep(2); // Move to OTP form step
        } catch (error) {
          setOtpSent(false);
          toast.error("Error sending OTP.");
        }
      } else {
        toast.error("Email does not match the registered email.");
        setOtpFormStep(1); // Stay at the first step
      }
    } else {
      // Handle phone number OTP sending logic here (for non-French languages)
      try {
        await axios.post('http://localhost:5000/send-sms-otp', { phone: emailOrPhone });
        setOtpFormStep(2); // Move to OTP form step
      } catch (error) {
        toast.error("Error sending OTP.");
      }
    }

    setLoading(false); // Turn off loading spinner
  };

  const handleSubmitOtp = () => {
    const otpInput = otp.trim(); // Get OTP from input field
    if (otpInput) {
      axios
        .post("http://localhost:5000/verify-otp", { otp: otpInput, email: enteredEmail })
        .then((response) => {
          if (response.data.success) {
            setOtpVerified(true);
            setOtpFormStep(1); // Reset OTP form after verification
            toast.success("OTP Verified!");
            setIsModalOpen(false); // Close the modal
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
    <div className="sidebar">
      <TwitterIcon className="sidebar__twitterIcon" />

      <Customlink to="/home/feed">
        <Sidebaroption active Icon={HomeIcon}  text={t("Home")}  />
      </Customlink>
      <Customlink to="/home/explore">
        <Sidebaroption Icon={SearchIcon} text={t("Explore")} />
      </Customlink>
      <Customlink to="/home/notification">
        <Sidebaroption Icon={NotificationsNoneIcon} text={t("Notifications")} />
      </Customlink>
      <Customlink to="/home/messages">
        <Sidebaroption Icon={MailOutlineIcon} text={t("Messages")} />
      </Customlink>
      <Customlink to="/home/bookmarks">
        <Sidebaroption Icon={BookmarkBorderIcon} text={t("Bookmarks")} />
      </Customlink>
      <Customlink to="/home/lists">
        <Sidebaroption Icon={ListAltIcon} text={t("Lists")} />
      </Customlink>
      <Customlink to="/home/profile">
        <Sidebaroption Icon={PermIdentityIcon} text={t("Profile")} />
      </Customlink>
      <Customlink to="/home/more">
        <Sidebaroption Icon={MoreIcon} text={t("More")} />
      </Customlink>

      <Button variant="outlined" className="sidebar__tweet" fullWidth>
        Tweet
      </Button>

      <div className="Profile__info">
        <Avatar
          src={
            loggedinUser[0]?.profileImage
              ? loggedinUser[0].profileImage
              : user && user.photoURL
          }
        />
        <div className="user__info">
          <h4>
            {loggedinUser[0]?.name ? loggedinUser[0].name : user && user.displayName}
          </h4>
          <h5>@{result}</h5>
        </div>
        <IconButton size="small" sx={{ ml: 2 }} onClick={handleClick}>
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorE1}
          open={Boolean(anchorE1)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => navigate("/home/profile")}>
            <Avatar
              src={
                loggedinUser[0]?.profileImage
                  ? loggedinUser[0]?.profileImage
                  : user && user.photoURL
              }
            />
            <div className="user__info subUser__info">
              <h4>{loggedinUser[0]?.name || user?.displayName}</h4>
              <h5>@{result}</h5>
            </div>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>Add an existing account</MenuItem>
          <MenuItem onClick={handlelogout}>Log out @{result}</MenuItem>
        </Menu>
      </div>


        <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
   
    </div>
  );
};

export default Sidebar;
