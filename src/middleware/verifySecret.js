import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

import fs from 'fs/promises';


// * Read Github config
const { webhook_secret, webhook_header_name, webhook_hash_alg } = config;

function verifyPostData(req, res, next) {
  if (!req.rawBody) {
    return next('Request body empty');
  }

  // * Read config file


  console.log(`Received request body`, JSON.stringify(req.rawBody, null, 2));

  const sig = Buffer.from(req.get(webhook_header_name) || '', 'utf8');
  const hmac = crypto.createHmac(webhook_hash_alg, webhook_secret);
  const digest = Buffer.from(
    webhook_hash_alg + '=' + hmac.update(req.rawBody).digest('hex'),
    'utf8'
  );
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return next(
      `Request body digest (${digest}) did not match ${webhook_header_name} (${sig})`
    );
  }

  console.log(`GitHub Signature OK.`);

  return next();
}

export { verifyPostData };
