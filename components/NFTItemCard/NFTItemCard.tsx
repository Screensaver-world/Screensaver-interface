import Link from 'next/link'
import { IProps } from './types'
import ActiveNFTItemCard from './ActiveNFTItemCard'

const NFTItemCard: React.FC<IProps> = (props) => {
  return (
    <Link href={`/object/${props?.tokenId}`}>
      <a>
        <ActiveNFTItemCard {...props} />
      </a>
    </Link>
  )
}

export default NFTItemCard
