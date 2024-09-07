import { z } from "@collinhacks/zod";
import { getDB } from "$common/db.ts";
import { performAtomicTransaction } from "$common/mod.ts";

const TimeStatsSchema = z.object({
	namespace: z.number(),
	lastRegisteredTimestamp: z.number(),
	count: z.number(),
	total: z.number(),
	min: z.number(),
	max: z.number(),
	avg: z.number(),
	variance: z.number(),
	sd: z.number(),
});

const TIME_STATS_KEY = "timeStats";

/**
 * Statistics about the time between registrations of numbers in a namespace.
 * 
 * This class is immutable. To update the statistics, use the {@link TimeStats.withNewTimestamp} method.
 * 
 * Statistics are calculated incrementally, causing minimal database overhead.
 */
export class TimeStats implements z.infer<typeof TimeStatsSchema> {
	/**
	 * Creates a new TimeStats object. Use {@link TimeStats.empty} to create an empty object. 
	 * Use {@link TimeStats.fromObject} to create an object from a serialized object. 
	 * Use {@link TimeStats.get} to get the statistics of a namespace from the database.
	 * Use {@link TimeStats.withNewTimestamp} to update the statistics.
	 * @param namespace the namespace the statistics are for
	 * @param lastRegisteredTimestamp the timestamp of the last ASN registration
	 * @param count the number of registrations
	 * @param total the sum of all time differences between registrations
	 * @param min the minimum time difference between registrations
	 * @param max the maximum time difference between registrations
	 * @param avg the average time difference between registrations
	 * @param variance the variance of the time differences between registrations
	 * @param sd the standard deviation of the time differences between registrations
	 */
	private constructor(
		public readonly namespace: number,
		public readonly lastRegisteredTimestamp: number,
		public readonly count: number,
		public readonly total: number,
		public readonly min: number,
		public readonly max: number,
		public readonly avg: number,
		public readonly variance: number,
		public readonly sd: number,
	) {
	}

	/**
	 * Updates the statistics with a new registration. This does not modify the current object.
	 * Changes are only applied to the returned object. 
	 * 
	 * For most use-cases, you should use {@link addTimestampToNamespaceStats} instead, as this
	 * function also handles database transactions. This bare function is useful for testing and
	 * potentially for other use-cases.
	 * 
	 * @param timestamp the timestamp of the new registration. Defaults to the current time.
	 * @returns new TimeStats object with the updated statistics
	 */
	public withNewTimestamp(timestamp?: number): TimeStats {
		timestamp = timestamp ?? Date.now();
		const diff = timestamp - this.lastRegisteredTimestamp;
		const newCount = this.count + 1;
		const newTotal = this.total + diff;
		const newAvg = newTotal / newCount;

		const newVariance = this.count === 0
			? 0
			: this.count === 1
			? ((this.avg - newAvg) ** 2 + (diff - newAvg) ** 2) / 2
			: (this.variance * this.count +
				(diff - newAvg) * (diff - this.avg)) / newCount;

		const newSD = Math.sqrt(newVariance);

		const newStats = new TimeStats(
			this.namespace,
			timestamp,
			newCount,
			newTotal,
			Math.min(this.min, diff),
			Math.max(this.max, diff),
			newAvg,
			newVariance,
			newSD,
		);

		return newStats;
	}

	/**
	 * Calculates the highest rate of registrations per millisecond that is expected to be exceeded 
	 * with a probability of less than the specified sigma level.
	 * 
	 * Common sigma levels are:
	 * - 1σ (68.27 %)
	 * - 2σ (95.45 %)
	 * - 3σ (99.73 %)
	 * - 6σ (99.99 %)
	 * 
	 * Note that this assumes a normal distribution of the time differences between registrations. 
	 * This may or may not be the case, depending on the use-case. However, this is a good estimate
	 * for most cases (and better than nothing when figuring out a bump rate after restoring a backup).
	 * 
	 * The primary use-case for this is bumping the namespaces after restoring a backup. 
	 * Since additional ASNs could have been registered between the last backup and the restore, 
	 * the bump rate should be higher than the average rate to avoid conflicts with the new ASNs.
	 * Estimating the distribution to be normal allows us this function to give system administrators
	 * a good estimate of the bump rate, based on a confidence level of their choice.
	 * 
	 * 
	 * @param sigma the number of standard deviations to add to the average rate
	 * @returns the highest rate of registrations per millisecond that is expected to be exceeded
	 * with a probability of less than the specified sigma level.
	 */
	public getHighestRate(sigma: number): number {
		if (this.avg === 0) {
			return 0;
		}
		if (this.sd === 0) {
			return 1 / this.avg;
		}
		return 1 / this.avg + sigma * 1 / this.sd;
	}

	/**
	 * Shows the most important statistics in a human-readable format.
	 * @returns a string representation of the statistics
	 */
	public toString(): string {
		return `${this.avg.toPrecision(5)} +/- ${
			(2 * this.sd).toPrecision(5)
		} ms between registrations (${this.count} numbers registered)`;
	}

	/**
	 * Creates a new TimeStats object from a compatible object.
	 * @param obj the object to create the TimeStats object from
	 * @returns `TimeStats` object created from the object
	 */
	public static fromObject(obj: unknown): TimeStats {
		const parsedObj = TimeStatsSchema.parse(obj);
		return new TimeStats(
			parsedObj.namespace,
			parsedObj.lastRegisteredTimestamp,
			parsedObj.count,
			parsedObj.total,
			parsedObj.min,
			parsedObj.max,
			parsedObj.avg,
			parsedObj.variance,
			parsedObj.sd,
		);
	}

	/**
	 * Creates an empty TimeStats object for the specified namespace.
	 * Use this to create a new TimeStats object for a namespace that has no registrations yet.
	 * @param namespace the namespace of the empty TimeStats object
	 * @returns an empty TimeStats object for the specified namespace
	 */
	public static empty(namespace: number): TimeStats {
		return new TimeStats(
			namespace,
			Date.now() - 10000, // 10 seconds ago
			0,
			0,
			0,
			0,
			0,
			0,
			0,
		);
	}

	/**
	 * Retrieves the TimeStats object for the specified namespace from the database.
	 * @param namespace the namespace of the TimeStats object to get
	 * @returns the TimeStats object for the specified namespace
	 */
	public static async get(
		namespace: number,
	): Promise<TimeStats> {
		const db = await getDB();
		const statsRes = await db.get([
			"namespace",
			namespace,
			TIME_STATS_KEY,
		]);
		return this.fromObject(statsRes.value ?? this.empty(namespace));
	}
}

/**
 * Updates the namespace's statistics with a new timestamp. Use this function when registering a new ASN.
 * @param namespace the namespace to add the timestamp to
 * @param timestamp the timestamp to add to the namespace's statistics. Defaults to the current time.
 * @returns a promise that resolves when the timestamp has been added to the namespace's statistics
 */
export function addTimestampToNamespaceStats(
	namespace: number,
	timestamp?: number,
): Promise<void> {
	timestamp = timestamp ?? Date.now();

	return performAtomicTransaction(async (db) => {
		const statsRes = await db.get([
			"namespace",
			namespace,
			TIME_STATS_KEY,
		]);

		const stats = TimeStats.fromObject(
			statsRes.value ?? TimeStats.empty(namespace),
		);

		return db.atomic()
			.check(statsRes)
			.set([
				"namespace",
				namespace,
				TIME_STATS_KEY,
			], stats.withNewTimestamp(timestamp))
			.commit();
	});
}
