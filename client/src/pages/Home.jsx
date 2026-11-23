import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, 
  FiPlay, 
  FiCpu, 
  FiTarget, 
  FiTrendingUp, 
  FiMic 
} from 'react-icons/fi';

// --- Typing Effect Component ---
const Typewriter = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 2000);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 75 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
      {words[index].substring(0, subIndex)}
    </span>
  );
};

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-200">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 overflow-hidden">
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Animated Badge */}
       

          {/* Main Headline with Typing Effect */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6"
          >
            Master Your Next <br />
            <Typewriter words={["Tech Interview", "Behavioral Round", "Dream Job"]} />
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed"
          >
            Practice with our advanced AI interviewer. Get real-time feedback on your tone, technical accuracy, and body language. Ace the interview with confidence.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button className="group relative flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-105 shadow-xl hover:shadow-black/20">
              <span className="relative z-10 flex items-center gap-2">
                Start Interview <FiMic />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button className="flex items-center justify-center gap-2 bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors hover:border-gray-300">
              <FiPlay className="text-blue-600" /> Watch Demo
            </button>
          </motion.div>

          {/* --- FEATURES GRID --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl"
          >
            {[
              { icon: <FiCpu />, title: "Smart AI Engine", desc: "Adapts to your skill level dynamically." },
              { icon: <FiTarget />, title: "Real-time Feedback", desc: "Instant analysis of your answers." },
              { icon: <FiTrendingUp />, title: "Track Progress", desc: "View your improvement over time." }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="group p-6 bg-white/60 backdrop-blur-lg rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white hover:-translate-y-2 transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">{feature.title}</h3>
                <p className="text-gray-500 text-left leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </main>
    </div>
  );
}

export default Home;