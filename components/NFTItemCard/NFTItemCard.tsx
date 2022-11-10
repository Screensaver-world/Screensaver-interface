import Link from 'next/link'
import { IProps } from './types'
import ActiveNFTItemCard from './ActiveNFTItemCard'

const NFTItemCard: React.FC<IProps> = (props) => {
  return (
    <Link href={`/object/${props?.tokenId}`}>
        <ActiveNFTItemCard {...props} />
    </Link>
  )
}

export default NFTItemCard
