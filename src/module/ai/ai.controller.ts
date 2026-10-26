import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AiService } from "./ai.service";
import { sendResponse } from "../../utils/sendResponse";

const chat = async (req: Request, res: Response) => {
	const { message } = req.body;
    

	const reply = await AiService.chatWithAI(message);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "AI response generated successfully",
		data: {
			reply,
		},
	});
};

export const AiController = {
	chat,
};