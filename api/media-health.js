import { getR2Credentials, getR2EnvStatus, getR2PublicBase } from "./lib/config.js";
import { getR2Client, getR2Bucket } from "./lib/r2.js";
import { HeadBucketCommand } from "@aws-sdk/client-s3";

export default async function handler(_req, res) {
  const r2 = getR2EnvStatus();
  const creds = getR2Credentials();

  let r2Reachable = false;
  let r2Error = null;

  if (creds.accessKeyId && creds.secretAccessKey) {
    try {
      const client = getR2Client();
      await client.send(new HeadBucketCommand({ Bucket: getR2Bucket() }));
      r2Reachable = true;
    } catch (err) {
      r2Error = err?.message || String(err);
    }
  }

  return res.status(200).json({
    ok: r2.hasAccessKeyId && r2.hasSecretAccessKey && !r2.accessKeyId.hasNewline && !r2.secretAccessKey.hasNewline,
    r2,
    r2Reachable,
    r2Error,
    publicBase: getR2PublicBase(),
    nodeEnv: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "unknown",
  });
}
