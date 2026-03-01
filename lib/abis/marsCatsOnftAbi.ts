// ABI for Mars Cats Shadow NFT contract on ApeChain (ERC721-based ONFT)
export const marsCatsOnftAbi = [
  {
    inputs: [
      { name: "dstEid", type: "uint32" },
      { name: "tokenIds", type: "uint256[]" },
      { name: "beneficiary", type: "address" },
      { name: "refundRecipient", type: "address" },
      { name: "supplementalGasLimit", type: "uint128" },
    ],
    name: "quoteSend",
    outputs: [
      { name: "nativeFee", type: "uint256" },
      { name: "lzTokenFee", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "dstEid", type: "uint32" },
      { name: "tokenIds", type: "uint256[]" },
      { name: "beneficiary", type: "address" },
      { name: "refundRecipient", type: "address" },
      { name: "supplementalGasLimit", type: "uint128" },
    ],
    name: "send",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
