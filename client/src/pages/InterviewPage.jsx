import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import  serverUrl  from "../config";

import InterviewStepper from "../components/interview/InterviewStepper";
import InterviewSetup from "../components/interview/InterviewSetup";
import InterviewAnalysis from "../components/interview/InterviewAnalysis";
import SystemCheck from "../components/interview/SystemCheck";

function InterviewPage() {
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [candidateData, setCandidateData] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [interviewId, setInterviewId] = useState(null);
    const [interviewConfig, setInterviewConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSetupComplete = async (data) => {
        setLoading(true);
        setError("");
        setCandidateData(data);

        try {
            const formData = new FormData();

            formData.append("role", data.role);
            formData.append("experience", data.experience);
            formData.append("company", data.company || "");
            formData.append("interviewType", data.interviewType);
            formData.append("resume", data.resume);

            if (data.jdFile)
                formData.append("jd", data.jdFile);

            if (data.jobDescription)
                formData.append("jobDescription", data.jobDescription);

            const { data: result } = await axios.post(
                `${serverUrl}/api/interview/analyze`,
                formData,
                { withCredentials: true }
            );

            setAnalysis(result.analysis);
            setInterviewId(result.interviewId);
            setCurrentStep(2);

        } catch (error) {
            setError(error.response?.data?.message || "Analysis failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAnalysisComplete = (config) => {
        setInterviewConfig(config);
        setCurrentStep(3);
    };

    const handleStartInterview = async () => {
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            const { data } = await axios.post(
                `${serverUrl}/api/interview/generate`,
                {
                    interviewId,
                    configuration: interviewConfig
                },
                { withCredentials: true }
            );

            navigate(`/interview/live/${data.interview._id}`, {
                state: { interview: data.interview }
            });

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to start interview"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (loading) return;
        setError("");
        setCurrentStep(prev => Math.max(1, prev - 1));
    };

    return (
        <div className="min-h-screen bg-[#f6f7f9] px-4 py-10">

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">
                    Prepare for your interview
                </h1>
                <p className="text-gray-500 mt-2">
                    Set up your personalized AI interview
                </p>
            </div>

            <InterviewStepper currentStep={currentStep} />

            {error && (
                <div className="max-w-4xl mx-auto my-4 p-4
                    bg-red-50 text-red-600 rounded-xl">
                    {error}
                </div>
            )}

            {currentStep === 1 && (
                <InterviewSetup
                    initialData={candidateData}
                    onAnalyze={handleSetupComplete}
                    loading={loading}
                />
            )}

            {currentStep === 2 && (
                <InterviewAnalysis
                    candidateData={candidateData}
                    analysis={analysis}
                    interviewId={interviewId}
                    initialConfig={interviewConfig}
                    onNext={handleAnalysisComplete}
                    onBack={handleBack}
                />
            )}

            {currentStep === 3 && (
                <>
                    <div className="max-w-4xl mx-auto my-5 p-4
                        bg-white border border-gray-200 rounded-xl">
                        <h3 className="font-semibold">
                            Interview cost: 50 credits
                        </h3>
                        <p className="text-sm text-gray-500">
                            5 questions · 7 minutes answering time
                        </p>
                    </div>

                    <SystemCheck
                        onStart={handleStartInterview}
                        onBack={handleBack}
                    />
                </>
            )}

            {loading && currentStep === 3 && (
                <div className="fixed inset-0 bg-black/40
                    flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl text-center">
                        <div className="w-10 h-10 border-4 border-gray-200
                            border-t-black rounded-full animate-spin mx-auto" />
                        <h3 className="font-semibold mt-4">
                            Preparing your interview...
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            AI is generating personalized questions.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}

export default InterviewPage;