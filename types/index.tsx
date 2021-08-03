export type Bid = {
  bidder: string
  timestamp: string
  amount: number
  accepted: boolean
}

type NFT = {
  name: string
  description: string
  creator: {
    id: string
  }
  creationDate: Date
  image: string
  animation_url: string
  metadataUri: string
  mimeType: string
  size: string
  tags: string[]
  tokenId: number
  mediaUri: string
  currentBid: Bid
}

export default NFT 
