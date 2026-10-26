
import { GoogleGenAI } from "@google/genai";
import config from "../../config/env.config";

const ai = new GoogleGenAI({
	apiKey: config.gemini_api_key,
});

const SYSTEM_PROMPT = `
You are the AI assistant for DistrictFix, a home service platform.

Known information:
- DistrictFix connects customers with service holders and workers.
- Known service categories include plumbing and electrical services.
- Customers can submit and track service requests.
- Service holders can manage requests and assign workers.
- Workers can manage their assigned services.

Rules:
- Reply in the user's language.
- Keep answers helpful and concise.
- Never invent prices, availability, or platform policies.
- Do not claim access to private customer records.
- If information is unknown, say so clearly.
`;

const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

const chatWithAI = async (message: string): Promise<string> => {
	const maxAttempts = 3;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			console.log(`Gemini request: attempt ${attempt}`);

			const response = await ai.models.generateContent({
				model: config.gemini_model,
				contents: message,
				config: {
					systemInstruction: SYSTEM_PROMPT,
					maxOutputTokens: 500,
					httpOptions: {
						timeout: 60000,
					},
				},
			});

			return (
				response.text ??
				"Sorry! try again!"
			);
		} catch (error: unknown) {
			const err = error as {
				status?: number;
				message?: string;
				error?: { message?: string; status?: string };
			};

			const status = err.status;
			const message =
				err.message ?? err.error?.message ?? "Unknown Gemini API error";

			console.error("Gemini API error:", {
				status,
				message,
				apiStatus: err.error?.status,
				attempt,
			});

			// 429 may indicate quota exhaustion or rate limiting.
			// Retrying immediately won't fix an exhausted quota.
			if (status === 429) {
				throw new Error(
					"Gemini API quota or rate limit exceeded. Check your Google AI Studio usage and rate limits.",
				);
			}

			const retryableStatuses = [500, 502, 503, 504];

			if (!retryableStatuses.includes(status ?? 0)) {
				throw error;
			}

			if (attempt === maxAttempts) {
				throw new Error(
					"AI assistant is temporarily unavailable. Please try again later.",
				);
			}

			await sleep(1000 * 2 ** (attempt - 1));
		}
	}

	throw new Error("AI assistant is temporarily unavailable.");
};

export const AiService = {
	chatWithAI,
};
