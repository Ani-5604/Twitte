import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { FaRegHandPointRight } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import "./LanguageSelector.css";

const OtpVerificationForm = ({
  onSubmit,
  isSubmitting,
  otp,
  setOtp,
  isOtpVerified,
  placeholder,
  buttonText,
}) => {
  return (
    <div className="otp-verification-form">
      <Input
        type="text"
        placeholder={placeholder}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="otp-input"
        required
      />
      <Button
        onClick={onSubmit}
        variant="contained"
        color="primary"
        disabled={isSubmitting || isOtpVerified}
        className="verify-button"
      >
        {isSubmitting ? "Verifying..." : buttonText}
      </Button>
    </div>
  );
};

const LanguageSelector = ({ currentLanguage }) => {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("language") || currentLanguage
  );
  const [previousLanguage, setPreviousLanguage] = useState(
    localStorage.getItem("language") || currentLanguage
  );
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  useEffect(() => {
    if (selectedLanguage) {
      i18n.changeLanguage(selectedLanguage).catch(() => {
        toast.error(t("Error changing language."));
      });
    }
  }, [selectedLanguage, i18n, t]);

  const handleLanguageChange = async (event) => {
    const lang = event.target.value;
    setPreviousLanguage(selectedLanguage);
    setSelectedLanguage(lang);
    localStorage.setItem("language", lang);

    if (lang === "en") {
      try {
        await i18n.changeLanguage(lang);
      } catch {
        toast.error(t("Error changing language."));
      }
      return;
    }

    if (lang === "fr") {
      toast.error(t("Please verify your email to change the language to French."));
      setShowModal(true);
      return;
    }

    toast.error(t("Please verify your phone number to change the language."));
    setShowModal(true);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault(); // Prevent form default behavior
    setIsSubmitting(true);

    try {
      console.log("Sending OTP to email:", email); // Debug log
      await axios.post("http://localhost:5000/send-otp", { email });
      setIsOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Error sending OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsSubmitting(true);
    console.log("Verifying OTP:", otp, "Email:", email);

    try {
      const response = await axios.post("http://localhost:5000/verify-otp", {
        otp,
        email,
      });

      if (response.data.success) {
        setIsOtpVerified(true);
        setShowModal(false); // Close the modal on success
        toast.success("OTP Verified!");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneNumberSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Sending OTP to phone number:", phoneNumber);
      await axios.post("http://localhost:5000/send-phone-otp", { phoneNumber });
      setIsOtpSent(true);
      toast.success("OTP sent to your phone number.");
    } catch (error) {
      console.error("Error sending phone OTP:", error);
      toast.error("Failed to send OTP to phone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = async () => {
    if (!isOtpVerified) {
      await i18n.changeLanguage(previousLanguage);
      setSelectedLanguage(previousLanguage);
    }
    setShowModal(false);
    setEmail("");
    setOtp("");
    setPhoneNumber("");
    setIsSubmitting(false);
    setIsOtpSent(false);
  };

  return (
    <div>
      <FormControl className="language-selector">
        <InputLabel>{t("Select Language")}</InputLabel>
        <Select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          label={t("Select Language")}
        >
          <MenuItem value="en">{t("English")}</MenuItem>
          <MenuItem value="es">{t("Spanish")}</MenuItem>
          <MenuItem value="hi">{t("Hindi")}</MenuItem>
          <MenuItem value="pt">{t("Portuguese")}</MenuItem>
          <MenuItem value="zh">{t("Chinese")}</MenuItem>
          <MenuItem value="fr">{t("French")}</MenuItem>
        </Select>
      </FormControl>

      <Modal open={showModal} onClose={handleCloseModal}>
        <Box className="modal-box">
          <div className="modal-header">
            <Typography variant="h6">{t("Verify Your Account")}</Typography>
            <MdClose onClick={handleCloseModal} className="close-icon" />
          </div>

          {/* Email Verification */}
          {selectedLanguage === "fr" && !isOtpSent && (
            <form className="form" onSubmit={handleEmailSubmit}>
              <Input
                type="email"
                placeholder={t("Enter your email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("Sending...") : t("Send OTP")}
              </Button>
            </form>
          )}

          {isOtpSent && selectedLanguage === "fr" && (
            <OtpVerificationForm
              onSubmit={handleOtpVerify}
              isSubmitting={isSubmitting}
              otp={otp}
              setOtp={setOtp}
              isOtpVerified={isOtpVerified}
              placeholder={t("Enter OTP")}
              buttonText={t("Verify OTP")}
            />
          )}

          {/* Phone Verification */}
          {selectedLanguage !== "fr" && !isOtpSent && (
            <form className="form" onSubmit={handlePhoneNumberSubmit}>
              <Input
                type="tel"
                placeholder={t("Enter your phone number")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="input"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("Sending...") : t("Send OTP")}
              </Button>
            </form>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default LanguageSelector;
