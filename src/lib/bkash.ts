import config from "../config/env.config";
import { RadisClient } from "./radis";

export const getBkashIdToken = async () => {
	try {
		const idTokenKey = "bkash:bkashAccessToken";
		const refreshTokenKey = "bkash:bkashRefreshToken";

		let bkashIdToken = await RadisClient.get(idTokenKey);
		const bkashIdTokenTTL = await RadisClient.ttl(idTokenKey);
		const bkashRefreshToken = await RadisClient.get(refreshTokenKey);
		const bkashRefreshTokenTTL = await RadisClient.ttl(refreshTokenKey);

		if (
			(bkashIdTokenTTL <= 600 || !bkashIdToken) &&
			bkashRefreshToken &&
			bkashRefreshTokenTTL > 600
		) {
			const refreshTokenResponse = await fetch(
				`${config.bkash_base_url}/tokenized/checkout/token/refresh`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						username: config.bkash_username,
						password: config.bkash_password,
					},
					body: JSON.stringify({
						app_key: config.bkash_app_key,
						app_secret: config.bkash_app_secret,
						refresh_token: bkashRefreshToken,
					}),
				},
			);

			const bkashRefreshTokenResult = await refreshTokenResponse.json();
			if (!refreshTokenResponse.ok) {
				throw new Error(
					bkashRefreshTokenResult?.statusMessage ||
						"Failed to refresh bKash token",
				);
			}

			bkashIdToken = bkashRefreshTokenResult.id_token as string;
			await RadisClient.set(idTokenKey, bkashIdToken, {
				expiration: {
					type: "EX",
					value: 60 * 60,
				},
			});

			if (bkashRefreshTokenResult.refresh_token) {
				await RadisClient.set(
					refreshTokenKey,
					bkashRefreshTokenResult.refresh_token,
					{
						expiration: {
							type: "EX",
							value: 60 * 60 * 24 * 28,
						},
					},
				);
			}
			return bkashIdToken;
		}

		if (bkashIdToken && bkashIdTokenTTL > 600) {
			return bkashIdToken;
		}

		const response = await fetch(
			`${config.bkash_base_url}/tokenized/checkout/token/grant`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					username: config.bkash_username,
					password: config.bkash_password,
				},
				body: JSON.stringify({
					app_key: config.bkash_app_key,
					app_secret: config.bkash_app_secret,
				}),
			},
		);

		console.log(response);
		const result = await response.json();

		if (!response.ok) {
			throw new Error(result?.statusMessage || "Failed to get bKash token");
		}

		await RadisClient.set(idTokenKey, result.id_token, {
			expiration: {
				type: "EX",
				value: 60 * 60,
			},
		});
		await RadisClient.set(refreshTokenKey, result.refresh_token, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 * 28, //28 days
			},
		});

		bkashIdToken = result.id_token;

		return bkashIdToken;
	} catch (error: any) {
		throw new Error(error.message);
	}
};
