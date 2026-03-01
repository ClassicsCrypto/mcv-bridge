export const beaconAbi = [
  {
    inputs: [
      { name: "dstEid", type: "uint32" },
      { name: "baseCollectionAddress", type: "address" },
      { name: "tokenIds", type: "uint256[]" },
      { name: "supplementalGasLimit", type: "uint128" },
    ],
    name: "quoteSend",
    outputs: [
      { name: "nativeFee", type: "uint256" },
      { name: "lzFee", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "dstEid", type: "uint32" },
      { name: "baseCollectionAddress", type: "address" },
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
    anonymous: false,
    inputs: [
      { indexed: true, name: "guid", type: "bytes32" },
      { indexed: false, name: "dstEid", type: "uint32" },
      { indexed: true, name: "fromAddress", type: "address" },
      { indexed: false, name: "tokenId", type: "uint256" },
    ],
    name: "ONFTSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "guid", type: "bytes32" },
      { indexed: false, name: "srcEid", type: "uint32" },
      { indexed: true, name: "toAddress", type: "address" },
      { indexed: false, name: "tokenId", type: "uint256" },
    ],
    name: "ONFTReceived",
    type: "event",
  },
] as const;
