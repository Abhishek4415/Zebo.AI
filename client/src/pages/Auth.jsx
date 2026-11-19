
import React from "react";
// import { motion } from "framer-motion";
import {motion} from "motion/react";
import { FaRobot } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { HiSparkles } from "react-icons/hi";
import { auth, provider } from '../utils/firebase.js';
import { signInWithPopup } from "firebase/auth";
import serverUrl from "../config.js"
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

function Auth() {
  const dispatch = useDispatch();
  const handleGoogleLogin = async () => {
    try{
      const response = await signInWithPopup(auth,provider)
      let user = response.user;
      let name = user.displayName;
      let email = user.email;
      
      const result = await axios.post( serverUrl + "/api/auth/google", { name, email }, { withCredentials: true });
      dispatch(setUserData(result.data)); 
    }catch(error){
      console.log(error)
      dispatch(setUserData(null)); 

    }
    // console.log("Continue with Google");
    
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f5f5] px-4 overflow-hidden">

      {/* Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full max-w-[525px] bg-white rounded-[28px] px-7 sm:px-10 py-10 sm:py-9 shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
      >

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-9"
        >
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <FaRobot className="text-white text-xl" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            Zebo.Ai
          </h2>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-[30px] sm:text-[34px] font-semibold text-black leading-tight">
            Continue with
          </h1>

          {/* Animated Smart Interview Badge */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center gap-2 mt-1 px-4 sm:px-5 py-2 rounded-full bg-[#dcfce9]"
          >
            <HiSparkles className="text-green-600 text-lg" />

            <span className="text-[23px] sm:text-[27px] font-semibold text-[#07964b]">
              AI Smart Interview
            </span>
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center text-gray-500 text-base sm:text-[17px] leading-[30px] mt-6 max-w-[410px] mx-auto"
        >
          Sign in to start AI-powered mock interviews, track your progress,
          and unlock detailed performance insights.
        </motion.p>

        {/* Google Login Button */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          // whileHover={{
          //   scale: 1.05,
          //   boxShadow: "0px 10px 25px rgba(0,0,0,0.18)",
          // }}
          whileTap={{opacity :1, scale: 0.95 }}
          onClick={handleGoogleLogin}
          className="w-full mt-9 h-[57px] bg-black hover:bg-[#171717] text-white rounded-full flex items-center justify-center gap-4 transition-colors duration-300 shadow-md"
        >
          <FcGoogle 
          className="text-xl text-[#4285F4]" />
          <span className="text-[17px] font-medium">
            Continue with Google
          </span>
        </motion.button>

      </motion.div>
    </div>
  );
}

export default Auth;
