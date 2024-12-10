import pinataSDK, { PinataPinResponse } from '@pinata/sdk';
import fs from 'fs';

export async function uploadImageToIPFS(): Promise<PinataPinResponse> {
  const pinata = new pinataSDK({ pinataJWTKey: 'yourPinataJWTKey' });
  const stream = fs.createReadStream('path/to/image.jpg');
  const res = await pinata.pinFileToIPFS(stream);
  return res;
}
