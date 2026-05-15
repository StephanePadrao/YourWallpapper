import {
	S3Client,
	PutObjectCommand,
	HeadObjectCommand,
	GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } from '$env/static/private';

export function isR2Configured(): boolean {
	return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

let client: S3Client | null = null;

function getClient(): S3Client {
	if (!client) {
		client = new S3Client({
			region: 'auto',
			endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: R2_ACCESS_KEY_ID,
				secretAccessKey: R2_SECRET_ACCESS_KEY
			}
		});
	}
	return client;
}

export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<void> {
	await getClient().send(
		new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: contentType
		})
	);
}

export async function objectExists(key: string): Promise<boolean> {
	try {
		await getClient().send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
		return true;
	} catch {
		return false;
	}
}

export async function getSignedDownloadUrl(key: string, ttlSeconds = 3600): Promise<string> {
	return getSignedUrl(
		getClient(),
		new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
		{ expiresIn: ttlSeconds }
	);
}
