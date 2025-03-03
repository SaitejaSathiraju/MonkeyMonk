import React, { useState, useEffect } from 'react';
import { auth } from "../../firebase/Firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";

import OtpInput from "otp-input-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const OTPdialog = ({ phoneNumber, onVerificationStatus }) => {
    const [otp, setOtp] = useState("");
    const [ph, setPh] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [user, setUser] = useState(null);
  
  useEffect(() => {
    const appVerifier = new RecaptchaVerifier("recaptcha-container", {
      size: "invisible",
      callback: () => {
        onSignup();
      },
      "expired-callback": () => {},
    }, auth);
    
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [phoneNumber]);

  function onSignup() {
    setLoading(true);
    window.confirmationResult.confirm(otp)
      .then((res) => {
        onVerificationStatus(true);
        setLoading(false);
      })
      .catch((err) => {
        onVerificationStatus(false);
        setLoading(false);
      });
  }
function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        setUser(res.user);
        setLoading(false);
        onVerificationStatus(true);
      })
      .catch((err) => {
        setLoading(false);
        onVerificationStatus(false);
      });
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur confirm-dialog">
      <div className="relative px-4 min-h-screen md:flex md:items-center md:justify-center">
        <div className="opacity-25 w-full h-full absolute z-10 inset-0"></div>
        <div className="rounded-lg md:max-w-md md:mx-auto p-4 fixed inset-x-0 bottom-0 z-50 mb-4 mx-4 md:relative shadow-lg bg-gray-800">
        <section className="flex items-center justify-center">
        <div id="recaptcha-container"></div>
      <div className='space-y-10'>
                <div className="bg-white text-primary-400 w-fit mx-auto p-4 rounded-full">
                  <BsFillShieldLockFill size={30} />
                </div>
                <label
                  htmlFor="otp"
                  className="font-bold text-xl text-white text-center"
                >
                  Enter your OTP
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  OTPLength={6}
                  otpType="number"
                  disabled={false}
                  autoFocus
                  className="opt-container"
                ></OtpInput>
                <button
                  onClick={onOTPVerify}
                  className="bg-primary-400 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                >
                  <span>Verify OTP</span>
                </button>
          </div>
    </section>
        </div>
      </div>
    </div>
  );
}

export default OTPdialog;
