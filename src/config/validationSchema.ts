import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PINATA_API_KEY: Joi.string().required(),
  PINATA_API_SECRET: Joi.string().required(),
  PINATA_JWT_TOKEN: Joi.string().required(),
  RPC_URL: Joi.string().required(),
  RPC_WSS: Joi.string().required(),
  SECRET_KEY_PAIR: Joi.string().required(),
  SIGNER_UUID: Joi.string().required(),
  NEYNAR_API_KEY: Joi.string().required(),
  NEYNAR_WEBHOOK_SECRET: Joi.string().required(),
  ANTHROPIC_API_KEY: Joi.string().required(),
});
