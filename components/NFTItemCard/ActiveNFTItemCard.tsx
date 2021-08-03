import React from 'react'
import ImageCard from '../ImageCard'
import { IProps } from './types'
import NFT from '../../types'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../../constants/gallery'
import { getNetworkLibrary } from '../../connectors'
import AccountId from '../AccountId'
import axios from 'axios'

var utils = require('ethers').utils

const NFTItemCard: React.FC<IProps> = ({ nft, creator }) => {
  const [forSale, setForSale] = useState(false)
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState< NFT | undefined>()

  async function getApproved() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )
    var approvedAddress = await contract.getApproved(nft?.tokenId)

    setForSale(approvedAddress === process.env.NEXT_PUBLIC_CONTRACT_ID)
  }

  async function getNFT(id) {

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )

    try {
      var uri = await contract.tokenURI(id)
      var metadata = await axios.get(uri)
      console.log(metadata)
      metadata.data.tokenId = id
      if (!!metadata.data.animation_url) {
        metadata.data.mediaUri = metadata.data.animation_url
      } else {
        metadata.data.mediaUri = metadata.data.image
      }
      metadata.data.currentBid = nft.currentBid
      metadata.data.mimeType = metadata.data.media.mimeType
      setItem(metadata.data)
    } catch (error) {
      console.log('ERROR getting token URI', error)
      return null
    }
  }

  // check for null values from DUMB subgraph
  useEffect(() => {
    if (!nft) return
    if (nft.mediaUri === null || nft.name === null) {
      getNFT(nft.tokenId)
    } else {
      setItem(nft)
    }
  }, [nft])

  useEffect(() => {
    if (!item) return
    getApproved()
  }, [])

  return !item ? (
    <div style={{ width: '345px', height: '618px' }}>
      <div className={'animate-pulse w-full rounded-xl h-full'}>
        <div
          className={'animation-pulse w-full rounded-xl h-full bg-gray-800'}
        />
      </div>
    </div>
  ) : (
    <ImageCard
      nft={item}
      srcUrl={item.mediaUri}
      footer={
        <div className={'py-3 bg-white bg-opacity-5 font-medium px-5'}>
          <div className={'flex flex-col space-y-2 h-20 mt-2 justify-start'}>
            {item.currentBid !== null ? (
              <>
                <div className={'text-xl font-medium'}>
                  {item.currentBid.accepted ? 'LASTEST SALE' : 'CURRENT BID'}
                </div>
                <div className={'text-3xl font-light'}>
                  {utils.formatEther(item.currentBid.amount)} MATIC
                </div>
              </>
            ) : forSale ? (
              <>
                <div className={'text-xl font-medium'}>CURRENT BID</div>
                <div className={'text-2xl font-light text-gray-100'}>
                  No bids yet
                </div>
              </>
            ) : (
              <div className={'text-xl font-medium'}>NOT FOR SALE </div>
            )}
          </div>
        </div>
      }
    >
      <div
        className={
          'flex flex-col justify-start space-y-2 px-5 overflow-hidden h-24'
        }
      >
        <h1 className={'font-bold text-2xl text-white mt-1'}>{item.name}</h1>
        <h2 className={'font-medium text-l'}>
          <AccountId linkToCreated address={creator} />
        </h2>
      </div>
    </ImageCard>
  )
}

export default NFTItemCard
