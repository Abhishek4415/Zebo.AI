import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiWifi,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiRefreshCw,
  FiShield,
  FiMonitor,
  FiVolume2,
  FiLoader,
} from "react-icons/fi";

function SystemCheck({ onStart, onBack }) {

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const speakerContextRef = useRef(null);
  const mountedRef = useRef(false);
  const testingRef = useRef(false);

  const [cameraStatus, setCameraStatus] = useState("pending");
  const [micStatus, setMicStatus] = useState("pending");
  const [internetStatus, setInternetStatus] = useState(
    navigator.onLine ? "success" : "failed"
  );

  const [speakerStatus, setSpeakerStatus] = useState("pending");
  const [micLevel, setMicLevel] = useState(0);
  const [micDetected, setMicDetected] = useState(false);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  // Stop camera and microphone
  const stopMedia = () => {

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (audioContextRef.current) {

      const context = audioContextRef.current;
      audioContextRef.current = null;

      if (context.state !== "closed") {
        context.close().catch(() => {});
      }

    }
  };

  // Monitor microphone volume
  const monitorMicrophone = async (stream) => {

    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error("Audio testing is not supported by this browser.");
    }

    const audioContext = new AudioContext();

    audioContextRef.current = audioContext;

    await audioContext.resume();

    if (!mountedRef.current) return;

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;

    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.fftSize);

    const updateLevel = () => {

      if (!mountedRef.current) return;

      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;

      for (let i = 0; i < dataArray.length; i++) {

        const value = (dataArray[i] - 128) / 128;

        sum += value * value;

      }

      const rms = Math.sqrt(sum / dataArray.length);

      const level = Math.min(100, rms * 500);

      const audioTrack = stream.getAudioTracks()[0];

      if (audioTrack?.enabled) {

        setMicLevel(level);

        if (level > 5) {
          setMicDetected(true);
        }

      } else {

        setMicLevel(0);

      }

      animationRef.current =
        requestAnimationFrame(updateLevel);

    };

    updateLevel();

  };

  // Request camera and microphone permissions
  const checkDevices = async () => {

    if (testingRef.current) return;

    testingRef.current = true;

    setLoading(true);
    setError("");

    stopMedia();

    setCameraStatus("checking");
    setMicStatus("checking");

    setCameraEnabled(false);
    setMicEnabled(false);
    setMicDetected(false);
    setMicLevel(0);

    let cameraStream = null;
    let microphoneStream = null;

    try {

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera and microphone require a supported browser and HTTPS or localhost."
        );
      }

      // Check camera independently
      try {

        cameraStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
            audio: false,
          });

        if (!mountedRef.current) {
          cameraStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setCameraStatus("success");
        setCameraEnabled(true);

      } catch {

        if (!mountedRef.current) return;

        setCameraStatus("failed");

      }

      // Check microphone independently
      try {

        microphoneStream =
          await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

        if (!mountedRef.current) {

          microphoneStream.getTracks().forEach((track) => track.stop());

          cameraStream?.getTracks().forEach((track) => track.stop());

          return;

        }

        setMicStatus("success");
        setMicEnabled(true);

      } catch {

        if (!mountedRef.current) return;

        setMicStatus("failed");

      }

      const tracks = [
        ...(cameraStream?.getTracks() || []),
        ...(microphoneStream?.getTracks() || []),
      ];

      if (tracks.length > 0) {

        const stream = new MediaStream(tracks);

        streamRef.current = stream;

        if (videoRef.current && cameraStream) {

          videoRef.current.srcObject = stream;

          videoRef.current.play().catch(() => {});

        }

        // Detect disconnected devices
        stream.getVideoTracks().forEach((track) => {

          track.onended = () => {

            if (!mountedRef.current) return;

            setCameraEnabled(false);
            setCameraStatus("failed");

          };

        });

        stream.getAudioTracks().forEach((track) => {

          track.onended = () => {

            if (!mountedRef.current) return;

            setMicEnabled(false);
            setMicStatus("failed");
            setMicDetected(false);
            setMicLevel(0);

          };

        });

      }

      if (microphoneStream) {

        try {

          await monitorMicrophone(microphoneStream);

        } catch {

          if (mountedRef.current) {
            setMicStatus("failed");
            setError("Unable to test microphone audio.");
          }

        }

      }

      if (!cameraStream || !microphoneStream) {

        setError(
          "Unable to access one or more devices. Check your browser permissions and try again."
        );

      }

    } catch (err) {

      if (!mountedRef.current) return;

      setCameraStatus("failed");
      setMicStatus("failed");
      setError(err.message);

    } finally {

      testingRef.current = false;

      if (mountedRef.current) {
        setLoading(false);
      }

    }
  };

  // Toggle camera
  const toggleCamera = () => {

    const videoTrack =
      streamRef.current?.getVideoTracks()[0];

    if (!videoTrack || videoTrack.readyState !== "live") return;

    videoTrack.enabled = !videoTrack.enabled;

    setCameraEnabled(videoTrack.enabled);

  };

  // Toggle microphone
  const toggleMicrophone = () => {

    const audioTrack =
      streamRef.current?.getAudioTracks()[0];

    if (!audioTrack || audioTrack.readyState !== "live") return;

    audioTrack.enabled = !audioTrack.enabled;

    setMicEnabled(audioTrack.enabled);

    if (!audioTrack.enabled) {

      setMicLevel(0);
      setMicDetected(false);

    }
  };

  // Browser internet connectivity check
  const checkInternet = () => {

    setInternetStatus(
      navigator.onLine ? "success" : "failed"
    );

  };

  // Play speaker test sound
  const testSpeaker = async () => {

    try {

      if (speakerContextRef.current) {

        await speakerContextRef.current.close().catch(() => {});

        speakerContextRef.current = null;

      }

      const AudioContext =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        throw new Error("Speaker testing is not supported.");
      }

      const audioContext = new AudioContext();

      speakerContextRef.current = audioContext;

      await audioContext.resume();

      if (!mountedRef.current) {

        audioContext.close().catch(() => {});

        return;

      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        440,
        audioContext.currentTime
      );

      gainNode.gain.setValueAtTime(
        0.08,
        audioContext.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 1.5
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.5);

      setSpeakerStatus("confirm");

      oscillator.onended = () => {

        if (audioContext.state !== "closed") {
          audioContext.close().catch(() => {});
        }

        if (speakerContextRef.current === audioContext) {
          speakerContextRef.current = null;
        }

      };

    } catch {

      if (mountedRef.current) {
        setSpeakerStatus("failed");
      }

    }
  };

  // Internet monitoring and component cleanup
  useEffect(() => {

    mountedRef.current = true;

    window.addEventListener("online", checkInternet);
    window.addEventListener("offline", checkInternet);

    return () => {

      mountedRef.current = false;

      window.removeEventListener("online", checkInternet);
      window.removeEventListener("offline", checkInternet);

      stopMedia();

      if (speakerContextRef.current) {

        speakerContextRef.current.close().catch(() => {});

        speakerContextRef.current = null;

      }

    };

  }, []);

  const allChecksPassed =
    cameraStatus === "success" &&
    micStatus === "success" &&
    internetStatus === "success" &&
    speakerStatus === "success" &&
    cameraEnabled &&
    micEnabled &&
    micDetected;

  const canStart = allChecksPassed && consent && !loading;

  const passedChecks = [
    cameraStatus === "success" && cameraEnabled,
    micStatus === "success" && micEnabled && micDetected,
    internetStatus === "success",
    speakerStatus === "success",
  ].filter(Boolean).length;

  const checks = [
    {
      title: "Camera",
      description: "Camera access and video preview",
      icon: FiVideo,
      status:
        cameraStatus === "success" && !cameraEnabled
          ? "pending"
          : cameraStatus,
    },
    {
      title: "Microphone",
      description: "Microphone access and audio input",
      icon: FiMic,
      status:
        micStatus === "success" && (!micEnabled || !micDetected)
          ? "pending"
          : micStatus,
    },
    {
      title: "Internet Connection",
      description: "Browser network connectivity",
      icon: FiWifi,
      status: internetStatus,
    },
    {
      title: "Speaker",
      description: "Audio playback verification",
      icon: FiVolume2,
      status: speakerStatus,
    },
  ];

  const renderStatus = (status) => {

    if (status === "success") {
      return (
        <span className="flex items-center gap-1
          text-green-600 text-xs font-semibold
          bg-green-50 px-3 py-1.5 rounded-full">

          <FiCheckCircle size={14} />
          Passed

        </span>
      );
    }

    if (status === "failed") {
      return (
        <span className="flex items-center gap-1
          text-red-500 text-xs font-semibold
          bg-red-50 px-3 py-1.5 rounded-full">

          <FiAlertCircle size={14} />
          Failed

        </span>
      );
    }

    if (status === "checking") {
      return (
        <span className="flex items-center gap-1
          text-blue-600 text-xs font-semibold
          bg-blue-50 px-3 py-1.5 rounded-full">

          <FiLoader className="animate-spin" />
          Checking

        </span>
      );
    }

    return (
      <span className="text-gray-500 text-xs font-semibold
        bg-gray-100 px-3 py-1.5 rounded-full">

        Pending

      </span>
    );
  };

  const handleStart = () => {

    if (!canStart) return;

    // LiveInterview.jsx must request its own media stream.
    stopMedia();

    onStart();

  };

  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-6"
    >

      {/* ================= HEADER ================= */}

      <div className="bg-linear-to-br from-blue-50 via-white
        to-purple-100 rounded-3xl border border-gray-200
        p-6 md:p-9">

        <div className="inline-flex items-center gap-2
          bg-white text-blue-600 border border-blue-100
          rounded-full px-4 py-2 text-xs font-semibold">

          <FiMonitor size={15} />
          STEP 03 — SYSTEM VERIFICATION

        </div>

        <h1 className="text-3xl md:text-4xl font-bold
          text-gray-900 mt-5">

          You're Almost

          <span className="bg-linear-to-r from-blue-600
            to-purple-600 bg-clip-text text-transparent">

            {" "}Ready.

          </span>

        </h1>

        <p className="text-sm text-gray-500 mt-3 max-w-2xl
          leading-relaxed">

          Check your camera, microphone, speaker and internet
          connection before starting your AI interview.

        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================= CAMERA PREVIEW ================= */}

        <div className="bg-white rounded-3xl border
          border-gray-200 shadow-sm p-6">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-lg font-bold text-gray-900">
              Camera Preview
            </h2>

            {cameraEnabled && cameraStatus === "success" && (

              <span className="flex items-center gap-2
                text-xs text-green-600 font-semibold">

                <span className="w-2 h-2 bg-green-500
                  rounded-full animate-pulse" />

                Camera Active

              </span>

            )}

          </div>

          <div className="relative aspect-video bg-[#111827]
            rounded-2xl overflow-hidden">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover
                scale-x-[-1]
                ${cameraEnabled ? "block" : "invisible"}`}
            />

            {!cameraEnabled && (

              <div className="absolute inset-0 flex flex-col
                items-center justify-center text-gray-400">

                <div className="bg-white/10 p-5 rounded-full mb-4">

                  <FiVideoOff size={35} />

                </div>

                <p className="text-sm font-medium">
                  Camera is turned off
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Enable your camera to see the preview.
                </p>

              </div>

            )}

            <div className="absolute bottom-4 left-4
              bg-black/60 text-white rounded-lg
              px-3 py-2 text-xs backdrop-blur-sm">

              {cameraEnabled ? "You — Live Preview" : "Preview"}

            </div>

          </div>

          {/* Camera and microphone controls */}

          <div className="flex justify-center gap-4 mt-5">

            <button
              type="button"
              aria-label="Toggle camera"
              aria-pressed={cameraEnabled}
              onClick={toggleCamera}
              disabled={cameraStatus !== "success" || loading}
              className={`w-12 h-12 rounded-full flex
                items-center justify-center transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  cameraEnabled
                    ? "bg-black text-white"
                    : "bg-red-50 text-red-500"
                }`}
            >

              {cameraEnabled
                ? <FiVideo size={21} />
                : <FiVideoOff size={21} />}

            </button>

            <button
              type="button"
              aria-label="Toggle microphone"
              aria-pressed={micEnabled}
              onClick={toggleMicrophone}
              disabled={micStatus !== "success" || loading}
              className={`w-12 h-12 rounded-full flex
                items-center justify-center transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  micEnabled
                    ? "bg-black text-white"
                    : "bg-red-50 text-red-500"
                }`}
            >

              {micEnabled
                ? <FiMic size={21} />
                : <FiMicOff size={21} />}

            </button>

          </div>

          {/* Microphone audio level */}

          <div className="border border-gray-200
            rounded-2xl p-5 mt-6">

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-2">

                <FiMic className="text-blue-600" />

                <h3 className="text-sm font-semibold text-gray-800">
                  Microphone Level
                </h3>

              </div>

              <span className="text-xs text-gray-500">
                {Math.round(micLevel)}%
              </span>

            </div>

            <div className="flex items-center gap-1 h-9">

              {Array.from({ length: 30 }).map((_, index) => (

                <div
                  key={index}
                  className={`flex-1 rounded-full transition-colors
                    ${
                      micLevel > (index / 30) * 100
                        ? index > 24
                          ? "bg-orange-400"
                          : "bg-blue-500"
                        : "bg-gray-200"
                    }`}
                  style={{
                    height: `${30 + ((index * 17) % 70)}%`,
                  }}
                />

              ))}

            </div>

            <p className="text-xs text-gray-500 mt-3">

              {micDetected && micEnabled
                ? "Audio input detected successfully."
                : "Speak a few words to test your microphone."}

            </p>

          </div>

          {/* Device Permission Button */}

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={checkDevices}
            className="w-full flex items-center justify-center
              gap-2 bg-black text-white rounded-full
              py-3.5 font-semibold text-sm mt-6
              hover:bg-gray-800 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading ? (

              <>
                <FiLoader className="animate-spin" />
                Checking Devices...
              </>

            ) : (

              <>
                <FiRefreshCw />
                {cameraStatus === "pending" && micStatus === "pending"
                  ? "Enable Camera & Microphone"
                  : "Test Devices Again"}
              </>

            )}

          </motion.button>

        </div>

        {/* ================= SYSTEM CHECKLIST ================= */}

        <div className="bg-white rounded-3xl border
          border-gray-200 shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                System Checklist
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Complete all checks to continue.
              </p>

            </div>

            <span className="text-sm font-semibold text-blue-600">
              {passedChecks}/4 Passed
            </span>

          </div>

          {/* Progress */}

          <div className="h-2 bg-gray-100 rounded-full
            overflow-hidden mb-6">

            <motion.div
              animate={{
                width: `${(passedChecks / 4) * 100}%`,
              }}
              className="h-full bg-linear-to-r from-blue-600
                to-purple-600 rounded-full"
            />

          </div>

          {/* Device Status Cards */}

          <div className="space-y-4">

            {checks.map((check) => (

              <div
                key={check.title}
                className="flex items-center gap-4 border
                  border-gray-200 rounded-2xl p-4"
              >

                <div className={`p-3 rounded-xl
                  ${
                    check.status === "success"
                      ? "bg-green-50 text-green-600"
                      : check.status === "failed"
                      ? "bg-red-50 text-red-500"
                      : "bg-blue-50 text-blue-600"
                  }`}>

                  <check.icon size={22} />

                </div>

                <div className="flex-1 min-w-0">

                  <h3 className="text-sm font-semibold text-gray-800">
                    {check.title}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {check.description}
                  </p>

                </div>

                {renderStatus(check.status)}

              </div>

            ))}

          </div>

          {/* Speaker Test */}

          <div className="bg-gray-50 border border-gray-200
            rounded-2xl p-4 mt-5">

            <div className="flex items-center justify-between gap-3">

              <div>

                <h3 className="text-sm font-semibold text-gray-800">
                  Test Your Speaker
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Play a sound to verify audio output.
                </p>

              </div>

              <button
                type="button"
                onClick={testSpeaker}
                className="flex items-center gap-2
                  bg-white border border-gray-200
                  rounded-full px-4 py-2 text-xs
                  font-semibold hover:border-blue-500"
              >

                <FiVolume2 size={17} />
                Play Sound

              </button>

            </div>

            {speakerStatus === "confirm" && (

              <div className="mt-4">

                <p className="text-sm text-gray-700 mb-3">
                  Did you hear the test sound?
                </p>

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() => setSpeakerStatus("success")}
                    className="flex-1 bg-green-50 text-green-600
                      border border-green-200 rounded-xl
                      py-2.5 text-sm font-semibold"
                  >

                    Yes, I heard it

                  </button>

                  <button
                    type="button"
                    onClick={() => setSpeakerStatus("failed")}
                    className="flex-1 bg-red-50 text-red-500
                      border border-red-200 rounded-xl
                      py-2.5 text-sm font-semibold"
                  >

                    No

                  </button>

                </div>

              </div>

            )}

          </div>

          {/* Internet Recheck */}

          <button
            type="button"
            onClick={checkInternet}
            className="flex items-center justify-center gap-2
              text-sm text-blue-600 font-medium w-full
              mt-5 hover:text-blue-800"
          >

            <FiRefreshCw size={15} />
            Recheck Internet Connection

          </button>

        </div>

      </div>

      {/* ================= ERROR MESSAGE ================= */}

      {error && (

        <div
          role="alert"
          className="flex items-center gap-3 bg-red-50
            border border-red-200 text-red-600
            rounded-2xl p-4 text-sm"
        >

          <FiAlertCircle size={20} className="shrink-0" />

          {error}

        </div>

      )}

      {/* ================= INTERVIEW GUIDELINES ================= */}

      <div className="bg-white border border-gray-200
        rounded-3xl p-6 shadow-sm">

        <div className="flex items-center gap-3 mb-5">

          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">

            <FiShield size={24} />

          </div>

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Before You Begin
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Follow these guidelines for a smooth interview.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {[
            "Choose a quiet and well-lit environment.",
            "Keep your camera and microphone enabled.",
            "Ensure you have a stable internet connection.",
            "Speak clearly and answer questions naturally.",
            "Avoid refreshing or closing the interview page.",
            "Keep unnecessary applications and tabs closed.",
          ].map((guideline) => (

            <div
              key={guideline}
              className="flex items-center gap-3
                text-sm text-gray-600 bg-gray-50
                rounded-xl p-3"
            >

              <FiCheckCircle className="text-blue-600 shrink-0" />

              {guideline}

            </div>

          ))}

        </div>

        <label className="flex items-start gap-3 mt-6
          border-t border-gray-100 pt-5 cursor-pointer">

          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-black shrink-0"
          />

          <span className="text-sm text-gray-600 leading-relaxed">

            I have reviewed the interview guidelines and agree
            to allow camera and microphone access during my
            interview session.

          </span>

        </label>

      </div>

      {/* ================= READY STATUS ================= */}

      {allChecksPassed && (

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 bg-green-50
            border border-green-200 rounded-2xl p-5"
        >

          <FiCheckCircle
            size={28}
            className="text-green-600 shrink-0"
          />

          <div>

            <h3 className="text-sm font-bold text-green-700">
              All System Checks Passed!
            </h3>

            <p className="text-xs text-green-600 mt-1">
              Your devices are ready. You can now start your AI interview.
            </p>

          </div>

        </motion.div>

      )}

      {/* ================= NAVIGATION ================= */}

      <div className="flex flex-col sm:flex-row items-center
        justify-between gap-4 pb-8">

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-auto flex items-center
            justify-center gap-2 border border-gray-300
            bg-white rounded-full px-7 py-3.5
            text-sm font-semibold text-gray-700
            hover:bg-gray-100 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
        >

          <FiArrowLeft size={18} />
          Back to Analysis

        </button>

        <div className="w-full sm:w-auto">

          <motion.button
            type="button"
            whileHover={{ scale: canStart ? 1.02 : 1 }}
            whileTap={{ scale: canStart ? 0.98 : 1 }}
            disabled={!canStart}
            onClick={handleStart}
            className="w-full flex items-center justify-center
              gap-3 bg-black text-white px-9 py-4
              rounded-full font-semibold shadow-lg
              hover:bg-gray-800 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
          >

            Start AI Interview
            <FiArrowRight size={21} />

          </motion.button>

          {!canStart && (

            <p className="text-xs text-gray-400 text-center mt-3">
              Complete all system checks and accept the guidelines.
            </p>

          )}

        </div>

      </div>

    </motion.div>

  );
}

export default SystemCheck;

// Save this file as SystemCheck.jsx, not InterviewSetup.jsx.
// Camera and microphone access require HTTPS or localhost.
// Internet check uses navigator.onLine; it does not measure
// connection speed, latency, or backend availability.
// Speaker verification requires confirmation from the user.
// All four system checks are mandatory in this implementation.
// Media streams are released when leaving this component.
// LiveInterview.jsx must request camera and microphone access again.
// Browser and backend integration have not been runtime-tested.