import { type EdgeWithExecutionContext } from "@logtail/edge/dist/es6/edgeWithExecutionContext";
import { Env } from "..";
import { sendRegistriesWebhook } from "../utils/discord";
import {
	Publisher,
	getPartnerRegistries,
	getPublisherRegistries,
} from "../utils/ppdvn";
import type { Registries } from "../utils/ppdvn";

// for checking "NXB Tre" and "NXB Kim Dong"
export const publishers = [8, 37];
// for checking partners of trusted publishers, e.g. "IPM"
export const trustedPublishers = [4, 12, 16, 28, 56, 59];

export async function runRegistriesCheck(
	env: Env,
	logger: EdgeWithExecutionContext,
) {
	const data: Registries = {
		kim: [],
		tre: [],
		ipm: [],
		amak: [],
		az: [],
		ichi: [],
		skybooks: [],
	};

	await Promise.all(
		publishers.map(
			async (publisher) => await getPublisherRegistries(env, data, publisher),
		),
	);

	await Promise.all(
		trustedPublishers.map(
			async (publisher) => await getPartnerRegistries(env, data, publisher),
		),
	);

	for (const publisher in data) {
		if (data[publisher as Publisher].length === 0) continue;

		let webhookUrl = undefined;

		// match the webhook url
		switch (publisher as Publisher) {
			case Publisher.Kim_Dong:
				webhookUrl = env.KIM_WEBHOOK_URL;
				break;
			case Publisher.Tre:
				webhookUrl = env.TRE_WEBHOOK_URL;
				break;
			case Publisher.IPM:
				webhookUrl = env.IPM_WEBHOOK_URL;
				break;
			case Publisher.AMAK:
				webhookUrl = env.AMAK_WEBHOOK_URL;
				break;
			case Publisher.AZ:
				webhookUrl = env.AZ_WEBHOOK_URL;
				break;
			case Publisher.Skybooks:
				webhookUrl = env.SKY_WEBHOOK_URL;
				break;
			case Publisher.Ichi:
				webhookUrl = env.ICHI_WEBHOOK_URL;
				break;
		}

		if (!webhookUrl) {
			logger.warn(`Missing webhook URL for ${publisher}`);
			continue;
		}

		try {
			await sendRegistriesWebhook(webhookUrl, data[publisher as Publisher]);
		} catch (err: any) {
			logger.error(`Error sending webhook for ${publisher}`, err);
		}
	}

	logger.info("Scheduled task: Check registries ran");
}
