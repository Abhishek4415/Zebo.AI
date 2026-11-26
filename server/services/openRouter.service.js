export const askAi = async (messages) => {
    try {
        if (
            !messages ||
            !Array.isArray(messages) ||
            messages.length === 0
        ) {
            throw new Error(
                "Messages array is empty or not provided."
            );
        }

        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("OpenRouter API key is missing.");
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                },

                body: JSON.stringify({
                    model: "openai/gpt-4o-mini",
                    messages: messages,
                    temperature: 0.3,
                }),

                signal: AbortSignal.timeout(60000),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "OpenRouter request failed."
            );
        }

        const content =
            data.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("No content received from AI.");
        }

        return content;

    } catch (error) {
        console.error("Error asking AI:", error.message);
        throw error;
    }
};