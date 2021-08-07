import React, {useState} from 'react'
import { ImageWithActions } from '../../components'
import NFT from '../../types'
import MintButton from '../../components/MintButton'
import AccountId from '../../components/AccountId'
import moment from 'moment'
import { useRouter } from 'next/router'
import {CopyToClipboard} from 'react-copy-to-clipboard';

interface IProps {
  metadata: NFT
  hash?: string
}

const ItemDetailView: React.VFC<IProps> = ({ metadata, hash }) => {
  const router = useRouter()
  const { tokenId, preview } = router.query
  const [copied, setCopied] = useState(false)
  
  return (
    <div className={'flex flex-col space-y-12'}>
      <div className={'flex flex-col space-y-8'}>
        <div className={'space-y-3'}>
          <ImageWithActions
            src={metadata.image}
            alt={metadata.name}
            nft={metadata}
            actions={[]}
          />
        </div>
        <div className={'px-3'}>
          <div
            className={'absolute right-0 w-full border-t border-gray-800 '}
          />

          {!!preview && <MintButton hash={hash} />}

          <div className={'text-4xl font-bold mt-3 mb-1 md:mt-12 mt-8'}>
            {metadata.name}
          </div>
          <div className={'text-xl mt-4 mb-6'}>
            <strong></strong>
            {metadata.description}
          </div>

          <CopyToClipboard text={`https://sswo.link/${tokenId}`} onCopy={() => setCopied(true)} >
            <button className="my-4 w-20 mr-4 justify-center inline-flex items-center px-6 py-3 border border-red-300 shadow-sm text-red-300 font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Share
            </button>
          </CopyToClipboard>
          {copied && 'copied'}
          <div className={'w-full border-t border-gray-800'} />

          <div className={'text-lg py-1 mt-3'}>
            <strong>Creator: </strong>{' '}
            <AccountId linkToCreated address={metadata.creator} />
          </div>
          <div className={'text-sm py-1'}>
            <strong>Minted: </strong>
            {moment(metadata.creationDate).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
          <div className={'text-sm py-1'}>
            <strong>MimeType: </strong> {metadata.media.mimeType}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetailView
