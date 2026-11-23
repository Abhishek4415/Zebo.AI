import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import serverUrl from '../config.js'; 
import { setUserData } from '../redux/userSlice.js';
import axios from 'axios';
import { 
  FiCpu, 
  FiDollarSign, 
  FiClock, 
  FiLogOut, 
  FiPlus,
  FiLogIn // Added for logged-out state
} from 'react-icons/fi';

const Navbar = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCreditPopup, setShowCreditPopup] = React.useState(false);
  const [showUserPopup, setShowUserPopup] = React.useState(false);
  
  const navbarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setShowCreditPopup(false);
        setShowUserPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      
      dispatch(setUserData(null)); 
      setShowUserPopup(false); 
      setShowCreditPopup(false); 
      navigate('/'); 
      
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navbarVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.1 } 
    }
  };

  const popupVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    exit: { opacity: 0, y: 5, scale: 0.95, transition: { duration: 0.15 } }
  };

  return (
    <div className="w-full flex justify-center pt-6 px-4 font-sans bg-gray-50 ">
      
      <motion.nav 
        ref={navbarRef}
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl bg-white/80 backdrop-blur-md border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-6 py-3 flex items-center justify-between relative z-50"
      >
        
        {/* --- LEFT: LOGO --- */}
        <motion.div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 bg-black rounded-xl overflow-hidden shadow-lg group-hover:shadow-black/20 transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-purple-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.div
              animate={{ rotate: [0, 0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
            >
              <FiCpu className="text-white text-xl relative z-10" />
            </motion.div>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight hidden sm:block">
            Zebo<span className="text-blue-600">.ai</span>
          </span>
        </motion.div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* 🟢 CONDITIONAL RENDERING: Only show if userData exists */}
          {userData ? (
            <>
              {/* Credits Pill & Popover */}
              <div 
                className="relative"
                onMouseEnter={() => setShowCreditPopup(true)}
                onMouseLeave={() => setShowCreditPopup(false)}
              >
                <motion.div 
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  className="flex items-center gap-2 bg-gray-100/80 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium cursor-help border border-transparent hover:border-gray-200 transition-colors"
                >
                  <FiDollarSign className="text-gray-500" />
                  <span className="font-semibold">
                    {/* No need for || 100 here anymore because we only render if userData exists */}
                    {userData.credits}
                  </span>
                </motion.div>

                <AnimatePresence>
                  {showCreditPopup && (
                    <motion.div 
                      variants={popupVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full mt-3 right-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 origin-top-right"
                    >
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Need more credits to continue your AI interviews?
                      </p>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        <FiPlus /> Buy more credits
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <motion.button 
                  onClick={() => setShowUserPopup(!showUserPopup)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full font-bold text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all uppercase"
                >
                  {userData.name.charAt(0)}
                </motion.button>

                <AnimatePresence>
                  {showUserPopup && (
                    <motion.div 
                      variants={popupVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full mt-3 right-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 origin-top-right"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-blue-600 capitalize truncate">
                          {userData.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {userData.email}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <motion.button 
                          onClick={() => {
                            navigate('/history');
                            setShowUserPopup(false);
                          }}
                          whileHover={{ x: 4, backgroundColor: "#f9fafb" }}
                          className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-gray-700 rounded-lg transition-colors"
                        >
                          <FiClock className="text-gray-400 text-base" />
                          Interview History
                        </motion.button>
                        
                        <motion.button 
                          onClick={handleLogout}
                          whileHover={{ x: 4, backgroundColor: "#fef2f2" }}
                          className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-red-600 rounded-lg transition-colors"
                        >
                          <FiLogOut className="text-red-400 text-base" />
                          Logout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* 🔴 LOGGED OUT STATE: Show Login Button */
            <motion.button
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-gray-800 transition-colors"
            >
              <FiLogIn /> Login
            </motion.button>
          )}

        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;