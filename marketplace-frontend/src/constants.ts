export const NETWORK = import.meta.env.VITE_BTC_NETWORK as 'mainnet' | 'testnet4' | 'regtest';


export const EXPLORER_BASE_URL = {
  mainnet: 'https://explorer.spacesprotocol.org',
  testnet4: 'https://testnet.spacesprotocol.org',
  regtest: 'https://testnet.spacesprotocol.org'
}[NETWORK];


export function getSpaceExplorerLink(spaceName: string): string {
  const formattedName = spaceName.startsWith('@') ? spaceName.substring(1) : spaceName;
  return `${EXPLORER_BASE_URL}/space/${formattedName}`;
}
