import Link from 'next/link'
import { IProps } from './types'
import ActiveNFTItemCard from './ActiveNFTItemCard'

const NFTItemCard: React.FC<IProps> = (props) => {
  return (
    <Link href={`/object/0x486ca491C9A0a9ACE266AA100976bfefC57A0Dd4/${props?.tokenId}`}>
      <a>
        <ActiveNFTItemCard {...props} />
      </a>
    </Link>
  )
}

export default NFTItemCard
