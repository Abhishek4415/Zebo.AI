import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
    FiMic,
    FiMicOff,
    FiVideo,
    FiVideoOff,
    FiClock,
    FiArrowRight,
    FiVolume2
} from "react-icons/fi";

import { FaRobot } from "react-icons/fa";
import serverUrl from "../config";

const conversation = {
    English: {
        transitions: [
            "Hello! Welcome to Zebo.ai. I hope you are doing well today. I'll be your interviewer. Please relax and answer naturally. Let's get started.",
            "Thank you for your introduction. Let's talk about your experience.",
            "Alright, let's move on to some role-specific concepts.",
            "Now, let's discuss a practical scenario.",
            "We've reached our final question. Take your time and think carefully."
        ],
        closing: "That brings us to the end of our interview. Thank you for your time today. Your performance report is ready. I wish you all the best!"
    },
    Hindi: {
        transitions: [
            "नमस्कार! ज़ेबो एआई में आपका स्वागत है। आशा है कि आप अच्छे हैं। आराम से अपने उत्तर दीजिए। चलिए शुरू करते हैं।",
            "आपके परिचय के लिए धन्यवाद। अब आपके अनुभव के बारे में बात करते हैं।",
            "अब आपके विषय से जुड़े कुछ प्रश्न देखते हैं।",
            "अब एक व्यावहारिक परिस्थिति पर चर्चा करते हैं।",
            "यह हमारा अंतिम प्रश्न है। आराम से सोचकर उत्तर दीजिए।"
        ],
        closing: "हमारा इंटरव्यू समाप्त हुआ। आपके समय के लिए धन्यवाद। आपकी रिपोर्ट तैयार है। आपको शुभकामनाएँ!"
    },
    Hinglish: {
        transitions: [
            "Hello! Welcome to Zebo.ai. I hope aap achhe hain. Relax rahiye aur naturally answer kijiye. Chaliye shuru karte hain.",
            "Thank you for your introduction. Ab aapke experience ke baare mein baat karte hain.",
            "Alright, ab role-specific concepts discuss karte hain.",
            "Chaliye ab ek practical scenario discuss karte hain.",
            "Ye hamara final question hai. Aaram se soch kar answer dijiye."
        ],
        closing: "Aaj ka interview yahin khatam hota hai. Thank you for your time. Aapki report ready hai. All the best!"
    }
};

// Speak once, with a timeout and explicit cancellation for cleanup.
function speakMessage(message, language, onDone, timeout = 45000) {
    let active = true;
    let timer;
    let speech;
    const synth = window.speechSynthesis;
    const finish = () => {
        if (!active) return;
        active = false;
        clearTimeout(timer);
        if (speech) speech.onend = speech.onerror = null;
        onDone();
    };
    if (!synth || !window.SpeechSynthesisUtterance) {
        finish();
        return () => {};
    }
    try {
        speech = new SpeechSynthesisUtterance(message);
        speech.lang = language;
        speech.rate = 0.95;
        speech.onend = speech.onerror = finish;
        timer = setTimeout(() => {
            finish();
            synth.cancel();
        }, timeout);
        synth.speak(speech);
    } catch {
        finish();
    }
    return () => {
        if (!active) return;
        active = false;
        clearTimeout(timer);
        if (speech) speech.onend = speech.onerror = null;
        synth.cancel();
    };
}

function LiveInterview() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");

    const [timeLeft, setTimeLeft] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [ready, setReady] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [interviewerMessage, setInterviewerMessage] = useState("");
    const [error, setError] = useState("");
    const [submissionFailed, setSubmissionFailed] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const recognitionRef = useRef(null);
    const submittingRef = useRef(false);
    const acceptingSpeechRef = useRef(false);
    const closingCleanupRef = useRef(null);
    const mountedRef = useRef(false);
    const resumeIndexRef = useRef(0);

    const questions = interview?.questions || [];
    const currentQuestion = questions[currentIndex];

    const isEvaluated = currentQuestion?.submitted || !!feedback;

    const language =
        interview?.configuration?.language === "Hindi"
            ? "hi-IN"
            : "en-IN";

    const script = conversation[interview?.configuration?.language] || conversation.English;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            closingCleanupRef.current?.();
        };
    }, []);

    const displayTime =
        timeLeft ?? currentQuestion?.timeLimit ?? 0;

    // 1. Fetch interview details

    useEffect(() => {

        let active = true;

        const fetchInterview = async () => {

            try {

                const { data } = await axios.get(
                    `${serverUrl}/api/interview/${id}`,
                    { withCredentials: true }
                );

                if (!active) return;

                if (data.status === "completed") {
                    navigate(`/interview/report/${id}`);
                    return;
                }

                if (
                    data.status !== "in_progress" ||
                    !data.questions?.length
                ) {
                    setError("This interview is not active.");
                    return;
                }

                setInterview(data);

                const next = data.questions.findIndex(
                    question => !question.submitted
                );

                if (next === -1) {

                    const last = data.questions.length - 1;

                    setCurrentIndex(last);
                    setAnswer(data.questions[last].answer);
                    setFeedback(data.questions[last].feedback);
                    setTimeLeft(0);

                } else {

                    resumeIndexRef.current = next;
                    setCurrentIndex(next);
                    setTimeLeft(null);
                    setAnswer("");
                    setFeedback("");

                }

                setReady(true);

            } catch {

                if (active) {
                    setError("Unable to load interview.");
                }

            }

        };

        fetchInterview();

        return () => {
            active = false;
        };

    }, [id, navigate]);

    // 2. Start camera

    useEffect(() => {

        if (!ready) return;

        let active = true;
        let cameraStream;

        const startCamera = async () => {

            try {

                cameraStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true
                    });

                if (!active) {

                    cameraStream.getTracks().forEach(
                        track => track.stop()
                    );

                    return;
                }

                streamRef.current = cameraStream;

                if (videoRef.current) {
                    videoRef.current.srcObject = cameraStream;
                }

                setIsCameraOn(true);

            } catch {

                if (active) setIsCameraOn(false);

            }

        };

        startCamera();

        return () => {

            active = false;

            cameraStream?.getTracks().forEach(
                track => track.stop()
            );

            streamRef.current = null;

        };

    }, [ready]);

    // 3. Speech recognition

    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = language;

        recognition.onresult = (event) => {

            if (!acceptingSpeechRef.current) return;

            const transcript = Array.from(event.results)
                .slice(event.resultIndex)
                .map(result => result[0].transcript)
                .join(" ");

            setAnswer(prev =>
                `${prev} ${transcript}`.trim()
            );

        };

        recognition.onstart = () => {
            setIsMicOn(true);
        };

        recognition.onend = () => {
            setIsMicOn(false);
        };

        recognition.onerror = () => {
            setIsMicOn(false);
        };

        recognitionRef.current = recognition;

        return () => {

            acceptingSpeechRef.current = false;

            recognition.onresult = null;
            recognition.onstart = null;
            recognition.onend = null;
            recognition.onerror = null;

            recognition.abort();
            recognitionRef.current = null;

        };

    }, [language]);

    // 4. Stop microphone

    const stopMic = () => {

        acceptingSpeechRef.current = false;

        recognitionRef.current?.abort();

        setIsMicOn(false);

    };

    // 5. Toggle microphone

    const toggleMic = () => {

        if (!recognitionRef.current) {

            setError(
                "Speech recognition is not supported in this browser."
            );

            return;
        }

        if (isSpeaking || isSubmitting || isEvaluated) return;

        if (isMicOn) {

            recognitionRef.current.stop();

        } else {

            try {

                setError("");
                acceptingSpeechRef.current = true;
                recognitionRef.current.start();

            } catch {

                setError("Unable to start microphone.");

            }

        }

    };

    // 6. Toggle camera

    const toggleCamera = () => {

        const track =
            streamRef.current?.getVideoTracks()[0];

        if (!track) {

            setError("Camera is unavailable. Check permissions.");
            return;

        }

        track.enabled = !track.enabled;

        setIsCameraOn(track.enabled);

    };

    // 7. Welcome the candidate and speak each question.
    useEffect(() => {
        if (!ready || !currentQuestion || currentQuestion.submitted) return;

        setTimeLeft(null);
        setIsSpeaking(true);

        const transition = currentIndex === resumeIndexRef.current && currentIndex > 0
            ? ""
            : script.transitions[currentIndex] || "";
        const message = `${transition} ${currentQuestion.question}`.trim();
        setInterviewerMessage(message);

        return speakMessage(message, language, () => {
            setIsSpeaking(false);
            setTimeLeft(currentQuestion.timeLimit);
        });
    }, [ready, currentIndex, currentQuestion, language, script]);

    // 8. Countdown timer

    useEffect(() => {

        if (
            !ready ||
            !currentQuestion ||
            isSpeaking ||
            isSubmitting ||
            isEvaluated ||
            timeLeft === null ||
            timeLeft <= 0
        ) return;

        const timer = setTimeout(() => {

            setTimeLeft(prev => Math.max(0, prev - 1));

        }, 1000);

        return () => clearTimeout(timer);

    }, [
        ready,
        currentQuestion,
        isSpeaking,
        isSubmitting,
        isEvaluated,
        timeLeft
    ]);

    // 9. Submit answer

    const submitAnswer = async () => {

        if (
            submittingRef.current ||
            isEvaluated ||
            !currentQuestion ||
            isSpeaking ||
            timeLeft === null
        ) return;

        submittingRef.current = true;

        setIsSubmitting(true);
        setSubmissionFailed(false);
        setError("");

        stopMic();

        try {

            const { data } = await axios.post(

                `${serverUrl}/api/interview/submit-answer`,

                {
                    interviewId: id,
                    questionIndex: currentIndex,
                    answer: answer.trim(),
                    timeTaken: currentQuestion.timeLimit - timeLeft
                },

                { withCredentials: true }

            );

            setFeedback(
                data.feedback || "Answer evaluated."
            );

            // Update the submitted question locally.
            setInterview(prev => ({

                ...prev,

                questions: prev.questions.map(
                    (question, index) =>

                        index === currentIndex
                            ? {
                                ...question,
                                ...data,
                                submitted: true
                            }
                            : question
                )

            }));

        } catch (error) {

            setSubmissionFailed(true);
            setError(
                error.response?.data?.message ||
                "Unable to submit answer. Please retry."
            );

        } finally {

            submittingRef.current = false;
            setIsSubmitting(false);

        }

    };

    // 10. Automatically submit when time expires

    useEffect(() => {

        if (
            ready &&
            currentQuestion &&
            !isEvaluated &&
            !isSpeaking &&
            !isSubmitting &&
            !submissionFailed &&
            timeLeft === 0
        ) {

            submitAnswer();

        }

    }, [
        ready,
        currentQuestion,
        timeLeft,
        isSpeaking,
        isSubmitting,
        isEvaluated,
        submissionFailed
    ]);

    // 11. Finish interview and deliver a friendly closing message.
    const finishInterview = async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setIsSubmitting(true);
        setError("");
        stopMic();

        try {
            const { data } = await axios.post(
                `${serverUrl}/api/interview/finish`,
                { interviewId: id },
                { withCredentials: true }
            );
            if (!mountedRef.current) return;

            setIsClosing(true);
            setIsSpeaking(true);
            setInterviewerMessage(script.closing);

            closingCleanupRef.current = speakMessage(script.closing, language, () => {
                if (!mountedRef.current) return;
                navigate(`/interview/report/${id}`, {
                    state: { interview: data },
                    replace: true
                });
            }, 20000);
        } catch {
            if (!mountedRef.current) return;
            setError("Unable to finish interview. Please retry.");
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    // 12. Move to next question

    const handleNext = () => {

        if (isSubmitting || !isEvaluated) return;

        if (currentIndex === questions.length - 1) {

            finishInterview();
            return;

        }

        stopMic();

        setAnswer("");
        setFeedback("");
        setSubmissionFailed(false);
        setError("");

        setTimeLeft(null);
        setIsSpeaking(true);

        setCurrentIndex(prev => prev + 1);

    };

    // Loading screen

    if (!ready || !currentQuestion) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <p>{error || "Loading interview..."}</p>

            </div>

        );

    }

    // Interview UI

    return (

        <div className="min-h-screen bg-[#f6f7f9] p-5">

            <div className="max-w-5xl mx-auto">

                {/* Header */}

                <div className="flex justify-between items-center mb-5">

                    <div>

                        <h1 className="text-2xl font-bold">
                            Zebo<span className="text-indigo-600">.ai</span>
                        </h1>

                        <p className="text-gray-500">
                            {interview.role}
                        </p>

                    </div>

                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
                        Live Interview
                    </span>

                </div>

                {/* Progress */}

                <div className="flex justify-between text-sm mb-2">

                    <span>
                        Question {currentIndex + 1} of {questions.length}
                    </span>

                    <span>{currentQuestion.difficulty}</span>

                </div>

                <div className="h-2 bg-gray-200 rounded-full mb-6">

                    <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{
                            width: `${((currentIndex + 1) / questions.length) * 100}%`
                        }}
                    />

                </div>

                {/* AI and Candidate Video */}

                <div className="grid md:grid-cols-2 gap-5">

                    {/* AI Interviewer */}

                    <div className="bg-linear-to-br from-blue-50 to-purple-100 rounded-2xl h-64 flex flex-col items-center justify-center">

                        <div className={`bg-white p-6 rounded-full shadow-sm
                            ${isSpeaking ? "animate-pulse" : ""}`}>

                            <FaRobot
                                size={45}
                                className="text-indigo-600"
                            />

                        </div>

                        <h2 className="font-semibold mt-4">
                            AI Interviewer
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">

                            {isClosing
                                ? "Closing interview..."
                                : isSubmitting
                                ? "Evaluating your answer..."
                                : isSpeaking
                                    ? "Speaking..."
                                    : isEvaluated
                                        ? "Answer evaluated"
                                        : isMicOn
                                            ? "Listening..."
                                            : "Waiting for your answer"}

                        </p>

                        {isSpeaking && (
                            <FiVolume2 className="mt-3 text-indigo-600 animate-pulse" />
                        )}

                    </div>

                    {/* Candidate Camera */}

                    <div className="relative bg-gray-900 rounded-2xl h-64 overflow-hidden">

                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover -scale-x-100
                                ${!isCameraOn ? "invisible" : ""}`}
                        />

                        {!isCameraOn && (

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">

                                <FiVideoOff size={35} />

                                <span>Camera Off</span>

                            </div>

                        )}

                        <span className="absolute bottom-3 left-3 text-white bg-black/50 px-3 py-1 rounded-lg">
                            You
                        </span>

                    </div>

                </div>

                {interviewerMessage && (
                    <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-indigo-600 mb-1">AI Interviewer</p>
                        <p className="text-sm text-gray-700">{interviewerMessage}</p>
                    </div>
                )}

                {/* Permanent Media Controls */}

                <div className="flex items-center justify-center gap-4 py-5">

                    <button
                        onClick={toggleMic}
                        disabled={isSpeaking || isSubmitting || isEvaluated}
                        title={isMicOn ? "Mute microphone" : "Enable microphone"}
                        aria-label={isMicOn ? "Mute microphone" : "Enable microphone"}
                        className={`p-4 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed
                            ${isMicOn
                                ? "bg-black text-white"
                                : "bg-red-100 text-red-600"}`}
                    >

                        {isMicOn
                            ? <FiMic size={20} />
                            : <FiMicOff size={20} />}

                    </button>

                    <button
                        onClick={toggleCamera}
                        title={isCameraOn ? "Turn camera off" : "Turn camera on"}
                        aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}
                        className={`p-4 rounded-full transition
                            ${isCameraOn
                                ? "bg-black text-white"
                                : "bg-red-100 text-red-600"}`}
                    >

                        {isCameraOn
                            ? <FiVideo size={20} />
                            : <FiVideoOff size={20} />}

                    </button>

                </div>

                {/* Question Card */}

                <div className="bg-white rounded-2xl border border-gray-200 p-6">

                    <div className="flex justify-between items-center mb-4">

                        <span className="text-sm text-gray-500">
                            Current Question
                        </span>

                        <div className={`flex items-center gap-2 font-semibold
                            ${displayTime <= 10 && timeLeft !== null
                                ? "text-red-500"
                                : "text-indigo-600"}`}>

                            <FiClock />

                            {Math.floor(displayTime / 60)}:
                            {String(displayTime % 60).padStart(2, "0")}

                        </div>

                    </div>

                    <h2 className="text-xl font-semibold mb-5">
                        {currentQuestion.question}
                    </h2>

                    {/* Answer Input */}

                    <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        disabled={
                            isSpeaking ||
                            isSubmitting ||
                            isEvaluated ||
                            timeLeft === null
                        }
                        placeholder="Speak or type your answer here..."
                        className="w-full min-h-36 border border-gray-200 rounded-xl p-4 outline-none focus:border-indigo-500 disabled:bg-gray-50"
                    />

                    {error && (

                        <p className="text-red-500 text-sm mt-3">
                            {error}
                        </p>

                    )}

                    {/* Submit Answer */}

                    {!isEvaluated && (

                        <div className="flex justify-between items-center mt-4 gap-3">

                            <p className="text-sm text-gray-500">

                                {isSpeaking
                                    ? "Listen to the question carefully."
                                    : isMicOn
                                        ? "Microphone is listening..."
                                        : "Enable your microphone or type your answer."}

                            </p>

                            <button
                                onClick={submitAnswer}
                                disabled={
                                    isSubmitting ||
                                    isSpeaking ||
                                    timeLeft === null
                                }
                                className="bg-black text-white px-6 py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                {isSubmitting
                                    ? "Evaluating..."
                                    : "Submit Answer"}

                            </button>

                        </div>

                    )}

                    {/* AI Feedback */}

                    {isEvaluated && (

                        <div className="mt-5 bg-green-50 border border-green-200 p-5 rounded-xl">

                            <h3 className="font-semibold text-green-800">
                                AI Feedback
                            </h3>

                            <p className="text-green-700 mt-2">
                                {feedback || currentQuestion.feedback}
                            </p>

                            <button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="mt-4 bg-black text-white px-5 py-3 rounded-full flex items-center gap-2 disabled:opacity-50"
                            >

                                {isSubmitting
                                    ? "Finishing..."
                                    : currentIndex === questions.length - 1
                                        ? "Finish Interview"
                                        : "Next Question"}

                                <FiArrowRight />

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default LiveInterview;
