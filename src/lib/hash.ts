import "server-only";
import { createHash } from "node:crypto";

export const hashIp = (ip: string) => createHash("sha256").update(`${process.env.IP_HASH_SALT || "neuvia"}:${ip}`).digest("hex").slice(0, 32);
