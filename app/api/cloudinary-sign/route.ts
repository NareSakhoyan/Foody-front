export const runtime = 'nodejs';

import crypto from 'crypto';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const authResult = await auth({ acceptsToken: 'any' });
  const userId =
    authResult &&
    'userId' in authResult &&
    typeof authResult.userId === 'string'
      ? authResult.userId
      : null;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured.' },
      { status: 500 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'foody';

  // Cloudinary requires params to be sorted alphabetically before signing.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  return NextResponse.json({
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
  });
}
