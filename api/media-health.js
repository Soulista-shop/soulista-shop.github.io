import { getR2EnvStatus, getR2PublicBase } from "./lib/config.js";

export default async function handler(_req, res) {
  const r2 = getR2EnvStatus();
  return res.status(200).json({
    ok: r2.hasAccessKeyId && r2.hasSecretAccessKey,
    r2,
    publicBase: getR2PublicBase(),
    nodeEnv: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "unknown",
  });
}
