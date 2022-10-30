export const candyMachineAddress = "0x03e3a509c858df55591e2978f2c1468d1cd88fd64bae517be11de672b0742261";
export const collectionName = "TestCollection101"; // Case sensitive!
export const MaxMint = 3
export const collectionCoverUrl = "https://r2aa42v3uaweghlsqfqb4d3vr6vh7egqqhnb3fqxhnigfxkxlcya.arweave.net/joAOarugLEMdcoFgHg91j6p_kNCB2h2WFztQYt1XWLA";
export const collectionBackgroundUrl = "https://6wnm7eahnmrz3w3a55pu627ibxus563nsfaykske3uuteyj5h77q.arweave.net/9ZrPkAdrI53bYO9fT2voDeku-22RQYVJRN0pMmE9P_8";
export const mode = "main"; // "dev" or "test" or "mainnet"

export let NODE_URL;
export const CONTRACT_ADDRESS = "0x8976580f6aa5835b65a237901d27ce9b1f0a9eb3bc8846d89beecd5a86b6853b";
export const COLLECTION_SIZE = 10
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
