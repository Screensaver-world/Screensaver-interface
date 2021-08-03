import NFT, {Bid} from '../../types'

export interface IProps {
  title?: string
  coverImageSrc?: string
  creator?: string
  endDateTime?: Date
  amountCollected?: number
  tokenId?: number
  nft?: NFT
  cardLoading?: boolean
  key?: number
  currentBid?: Bid 
}
