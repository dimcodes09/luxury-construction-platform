import { v2 as cloudinary } from "cloudinary";

/* SRS INT-04 / NFR-SEC-08 — Cloudinary is the ONLY media origin.
 *
 * NFR-SEC-08: "File uploads validated by MAGIC BYTES, NOT EXTENSION;
 * size-capped; SERVED FROM CLOUDINARY, NEVER FROM THE APPLICATION ORIGIN."
 * Serving user-supplied files from our own origin would put attacker-controlled
 * bytes inside our CSP origin (NFR-SEC-02), which is exactly what the
 * `default-src 'self'` policy is meant to prevent.
 *
 * NFR-SEC-07: keys are server-side only and never reach the client. Uploads are
 * therefore SIGNED — the browser gets a one-shot signature, not a credential.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export const UPLOAD_FOLDERS = {
  /* FR-AI-19 / NFR-PRIV-03 — visitor room photos, deleted after 30 days.
   * Kept in their own folder so a retention sweep can never touch project
   * media by mistake. */
  designStudio: "zyvora/design-studio",
  projects: "zyvora/projects",
  behindTheWall: "zyvora/behind-the-wall",
  materials: "zyvora/materials",
  team: "zyvora/team",
  journal: "zyvora/journal",
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

/* NFR-SEC-08 — magic-byte sniffing. Extensions and Content-Type headers are
 * both attacker-controlled; the first bytes of the file are not.
 *
 * HEIC/HEIF sit inside an ISO-BMFF container: bytes 4-8 are "ftyp", followed by
 * a brand such as heic/heix/mif1. FR-AI-02 requires HEIC support because it is
 * the iPhone default and rejecting it would silently exclude a large share of
 * this audience. */
const MAGIC_SIGNATURES: { type: string; test: (bytes: Uint8Array) => boolean }[] =
  [
    {
      type: "image/jpeg",
      test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    },
    {
      type: "image/png",
      test: (b) =>
        b[0] === 0x89 &&
        b[1] === 0x50 &&
        b[2] === 0x4e &&
        b[3] === 0x47 &&
        b[4] === 0x0d &&
        b[5] === 0x0a &&
        b[6] === 0x1a &&
        b[7] === 0x0a,
    },
    {
      type: "image/webp",
      test: (b) =>
        b[0] === 0x52 &&
        b[1] === 0x49 &&
        b[2] === 0x46 &&
        b[3] === 0x46 &&
        b[8] === 0x57 &&
        b[9] === 0x45 &&
        b[10] === 0x42 &&
        b[11] === 0x50,
    },
    {
      type: "image/heic",
      test: (b) => {
        const ftyp =
          b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70;
        if (!ftyp) return false;
        const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
        return ["heic", "heix", "hevc", "mif1", "msf1", "heim"].includes(brand);
      },
    },
  ];

export function sniffImageType(buffer: ArrayBuffer | Uint8Array): string | null {
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer.slice(0, 16));
  if (bytes.length < 12) return null;
  return MAGIC_SIGNATURES.find((sig) => sig.test(bytes))?.type ?? null;
}

/**
 * A short-lived signature for a direct browser → Cloudinary upload.
 *
 * The browser never sees the API secret (NFR-SEC-07). The signature pins the
 * folder and any transformation, so a client cannot redirect the upload
 * somewhere else or strip a moderation-relevant setting.
 */
export function createUploadSignature(params: {
  folder: UploadFolder;
  publicId?: string;
  eager?: string;
}): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error(
      "Cloudinary is not configured. See .env.example for the required variables.",
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const toSign: Record<string, string | number> = {
    folder: params.folder,
    timestamp,
    ...(params.publicId ? { public_id: params.publicId } : {}),
    ...(params.eager ? { eager: params.eager } : {}),
  };

  const signature = cloudinary.utils.api_sign_request(toSign, apiSecret);

  return { signature, timestamp, apiKey, cloudName, folder: params.folder };
}

/* SRS §2.2 / NFR-PERF-06 — named transformations per aspect ratio
 * (implementationplan.md Phase 0). Centralised so a ratio used by a component
 * and the crop enforced at upload cannot drift.
 *
 * FR-ADM-14: before/after pairing validates MATCHING aspect ratios and offers a
 * crop on mismatch — §3.14 requires "identical dimensions, identical framing,
 * identical crop", and a mismatched pair makes the slider look broken. */
export const TRANSFORMS = {
  projectCard: "c_fill,ar_16:10,g_auto,q_auto:good,f_auto",
  beforeAfterDesktop: "c_fill,ar_16:9,g_auto,q_72,f_auto",
  beforeAfterMobile: "c_fill,ar_4:3,g_auto,q_72,f_auto",
  materialSwatch: "c_fill,ar_1:1,g_auto,q_auto:good,f_auto",
  hero: "c_fill,ar_16:9,g_auto,q_auto:good,f_auto",
  ogImage: "c_fill,ar_1.91:1,g_auto,q_auto:good,f_auto",
} as const;

export function buildUrl(publicId: string, transform: string): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}

/** FR-AI-19 — the 30-day retention sweep for design-studio uploads. */
export async function deleteAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}
