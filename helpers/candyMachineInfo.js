export const candyMachineAddress = "0x5d08f8a55f16b3cead86b6ffe473267a8e525af82ee3d910c13043f1f6531e0d";
export const collectionName = "TestCollection101"; // Case sensitive!
export const MaxMint = 3
export const collectionCoverUrl = "https://r2aa42v3uaweghlsqfqb4d3vr6vh7egqqhnb3fqxhnigfxkxlcya.arweave.net/joAOarugLEMdcoFgHg91j6p_kNCB2h2WFztQYt1XWLA";
export const collectionBackgroundUrl = "https://6wnm7eahnmrz3w3a55pu627ibxus563nsfaykske3uuteyj5h77q.arweave.net/9ZrPkAdrI53bYO9fT2voDeku-22RQYVJRN0pMmE9P_8";
export const mode = "main"; // "dev" or "test" or "mainnet"

export let NODE_URL;
export const CONTRACT_ADDRESS = "0xec9f97e3c0f325a6cfc2be6b026aebac49d2eda9ae8af1fd923381d2ca7da2a0";
export const COLLECTION_SIZE = 100
let FAUCET_URL;
if (mode == "dev") {
    NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";
    FAUCET_URL = "https://faucet.devnet.aptoslabs.com";
} else if (mode === "test") {
    NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
    FAUCET_URL = "https://faucet.testnet.aptoslabs.com";
} else {
    NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1";
    FAUCET_URL = null;
}
