import React from 'react'
import ImageCard from '../ImageCard'
import { IProps } from './types'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../../constants/gallery'
import { getNetworkLibrary } from '../../connectors'
import AccountId from '../AccountId'
import { gql, useLazyQuery } from '@apollo/client'
import { createOperation } from '@apollo/client/link/utils'
import axios from 'axios'
import NFT from '../../types'
import makeBlockie from 'ethereum-blockies-base64'

const utils = require('ethers').utils

const BID_QUERY = gql`
  query Bid($item: String) {
    bidLogs(where: { item: $item, accepted: true }) {
      id
      item {
        id
      }
      amount
      accepted
      canceled
    }
  }
`

const NFTItemCard: React.FC<IProps> = ({ nft }) => {
  const [currentBid, setCurrentBid] = useState<number | undefined | null>()
  const [lastSale, setLastSale] = useState<number | undefined>()
  const [forSale, setForSale] = useState(false)
  const [safeNFT, setSafeNFT] = useState< NFT | undefined>()

  const [loadBids, { loading, error, data }] = useLazyQuery(BID_QUERY, {
    variables: { item: nft?.tokenId.toString() },
  })

  useEffect(() => {
    if (nft.broken || nft.mediaUri === null) {
      getNFTFromContract()
    } else {
      setSafeNFT({ ...nft, mediaUri: nft.mediaUri.replace('https://ipfs.io', 'https://screensaver.mypinata.cloud') })
    }
  }, [nft])

  async function getNFTFromContract() {

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )

    const uri = await contract.tokenURI(nft.tokenId)
    console.log("URI", uri)
    if (uri.includes(undefined)) return null
    const metadata = await axios.get(uri)
    const itemFromContract: NFT = {
      name: "",
      description: "",
      broken: true,
      creator: {
        id: ""
      },
      creationDate: new Date(),
      image: "",
      animation_url: "",
      metadataUri: "",
      mediaUri: "",
      thumbnail: "",
      mimeType: "",
      size: "",
      media: {
        mimeType: "",
        size: ""
      },
      tags: [],
      tokenId: 0,
      id: 0
  
  };

    console.log(metadata.data)
    itemFromContract.name = metadata.data.name
    itemFromContract.creator.id
    itemFromContract.mimeType = metadata.data.media.mimeType
    itemFromContract.tokenId = metadata.data.id
    itemFromContract.creator.id = metadata.data.creator
    itemFromContract.creationDate = metadata.data.creationDate

    if (!metadata.data.animation_url) {
      itemFromContract.mediaUri = metadata.data.image
      itemFromContract.mediaUri.replace('https://ipfs.io', 'https://screensaver.mypinata.cloud')
    } else {
      itemFromContract.mediaUri = metadata.data.animation_url
      itemFromContract.thumbnail = metadata.data.image
      itemFromContract.mediaUri.replace('https://ipfs.io', 'https://screensaver.mypinata.cloud')
      itemFromContract.thumbnail.replace('https://ipfs.io', 'https://screensaver.mypinata.cloud')
    }

    setSafeNFT(itemFromContract)
  }

  // get current bids
  async function currentBids() {
    if (!nft?.tokenId) return

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )

    const currentBid = await contract.currentBidDetailsOfToken(nft.tokenId)

    if (utils.formatEther(currentBid[0]) === '0.0') {
      setCurrentBid(null)
    } else {
      setCurrentBid(utils.formatEther(currentBid[0]))
    }
  }

  // get approved
  async function getApproved() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )
    const approvedAddress = await contract.getApproved(nft?.tokenId)

    setForSale(approvedAddress === process.env.NEXT_PUBLIC_CONTRACT_ID)
  }

  useEffect(() => {
    if (currentBid !== null || currentBid === undefined) return;
    loadBids()
  }, [currentBid])

  useEffect(() => {
    if (loading || !data) return;

    const bidLogsForSorting = [...data.bidLogs]

    if (data.bidLogs.length > 0) {
      const sortedByMostRecentBids = bidLogsForSorting.sort(function (x, y) {
        return y.timestamp - x.timestamp
      })
      setLastSale(utils.formatEther(sortedByMostRecentBids[0].amount))
    }
  }, [data])

  useEffect(() => {
    getApproved()
    currentBids()
  }, [])

  if (!safeNFT) {
    return <div style={{width: '345px', height: '618px'}} ><div className={'animate-pulse w-full rounded-xl h-full'}><div className={'animation-pulse w-full rounded-xl h-full bg-gray-800'}/></div></div> 
  }

  return (
    <ImageCard
      nft={safeNFT}
      srcUrl={safeNFT.mediaUri}
      footer={
        <div className={'py-3 font-medium px-5 border-t border-gray-800'}>
          <div className={'flex flex-col h-20 justify-center'}>
            {!lastSale && (
              <>
                <div className={'text-xl font-medium'}>Current Bid</div>
                <div className={'text-2xl font-light'}>
                  {currentBid ? (
                    `${currentBid} Matic`
                  ) : forSale ? (
                    <div className={'text-lg font-light mt-2 text-gray-100'}>
                      No bids yet
                    </div>
                  ) : (
                    <div className={'text-lg font-light mt-2 text-gray-100'}>
                      Not for sale
                    </div>
                  )}
                </div>
              </>
            )}

            {(!!lastSale && !currentBid) && (
              <>
                <div className={'text-xl font-medium'}>Latest Sale</div>

                <div className={'text-2xl font-light'}>
                  {`${lastSale} Matic`}
                </div>
              </>
            )}
          </div>
        </div>
      }
    >
      <div
        className={
          'flex flex-col justify-start space-y-2 px-5 overflow-hidden h-28 mt-3'
        }
      >
        <h1 className={'font-bold text-2xl text-white h-full max-h-16 line-clamp-2 overflow-ellipsis'}>{safeNFT.name}</h1>
        <h2 className={'font-medium text-md flex items-center h-10'}>
        <img
        className={'h-5 w-5 mr-3'}
          style={{ borderRadius: '50%'}}
          src={makeBlockie(safeNFT.creator.id.toString())}
        />
        <AccountId link={'created'} address={safeNFT.creator.id} />
        </h2>
      </div>
    </ImageCard>
  )
}

export default NFTItemCard
