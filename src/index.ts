import { Logtail } from "@logtail/edge";

import { runRegistriesCheck } from "./jobs/ppdvn";
import { runKDCCheck } from "./jobs/kimdong";

export interface Env {
	MAYOI_KV: KVNamespace;
	LOGTAIL_TOKEN: string;
	KDC_WEBHOOK_URL: string;
	KIM_WEBHOOK_URL: string;
	TRE_WEBHOOK_URL: string;
	IPM_WEBHOOK_URL: string;
	AMAK_WEBHOOK_URL: string;
	AZ_WEBHOOK_URL: string;
	ICHI_WEBHOOK_URL: string;
	SKY_WEBHOOK_URL: string;
}

export default {
	async scheduled(
		event: ScheduledEvent,
		env: Env,
		ctx: ExecutionContext,
	): Promise<void> {
		const baseLogger = new Logtail(env.LOGTAIL_TOKEN);
		const logger = baseLogger.withExecutionContext(ctx);

		if (event.cron === "0 5-17/12 * * *") {
			try {
				await runRegistriesCheck(env, logger);
			} catch (err: any) {
				logger.error("DKXB error occurred!", err);
			}
		}

		if (event.cron === "0 */6 * * *") {
			try {
				await runKDCCheck(env, logger);
			} catch (err: any) {
				logger.error("Kim Dong Comics error occurred!", err);
			}
		}
	},
};
