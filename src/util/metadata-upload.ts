import axios from 'axios';

/**
 * Uploads metadata JSON to IPFS via Pinata.
 * @param metadata The JSON object containing metadata.
 * @returns The IPFS URL of the uploaded metadata.
 */
export async function uploadMetadataToIPFS(
  metadata: object,
  apiKey: string,
  apiSecret: string,
): Promise<string> {
  try {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

    const response = await axios.post(url, metadata, {
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    console.log('Metadata uploaded to IPFS:', ipfsUrl);

    return ipfsUrl;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Error uploading metadata to IPFS:',
        error.response?.data || error.message,
      );
    } else {
      console.error('Error uploading metadata to IPFS:', error);
    }
    throw error;
  }
}
