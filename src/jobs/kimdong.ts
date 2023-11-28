import { type EdgeWithExecutionContext } from "@logtail/edge/dist/es6/edgeWithExecutionContext";
import { Env } from "..";
import { getBooks } from "../utils/kimdong";
import { sendKDCWebhook } from "../utils/discord";

export async function runKDCCheck(env: Env, logger: EdgeWithExecutionContext) {
	const lastId = await env.MAYOI_KV.get("last_fetched_id");

	const { data, latestId } = await getBooks(
		lastId ? parseInt(lastId) : undefined,
	);

	try {
		await sendKDCWebhook(env.KDC_WEBHOOK_URL, data);
	} catch (err: any) {
		logger.error("Error sending KDC webhook", err);
	}

	await env.MAYOI_KV.put("last_fetched_id", latestId.toString());

	logger.info("Schduled task: Kim Dong Comics ran");
}
