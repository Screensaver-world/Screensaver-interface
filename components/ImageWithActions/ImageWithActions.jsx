import React, { useState, useEffect } from 'react'
import ActionButton from './ActionButton'
import NFT from '../../types'
import VideoPlayer from '../MediaViewer/VideoPlayer'
import AudioPlayer from '../MediaViewer/AudioPlayer'

const ImageWithActions = ({ src, nft, alt, actions }) => {
  const [type, setType] = useState('')

  useEffect(() => {
    if (!nft?.media?.mimeType) return
    const typeArray = nft?.media?.mimeType.split('/')
    setType(typeArray[0])
  }, [nft])

  return (
    <div className={'min-h-96'}>
      { type === '' && <div>Loading...</div>}
      {/* { type && <iframe className={'w-full h-96 '} src={nft.animation_url}></iframe>} */}
      { type === 'image' && (
        <img src={nft.image} className={'w-full'} />
      )}
      {type === 'video' && (
        <VideoPlayer fileUrl={nft.animation_url} />
      )}
      {type === 'audio' && (
        <AudioPlayer fileUrl={nft.animation_url} />
      )}
      {(type === 'model' || nft?.media?.mimeType === 'application/octet-stream') && (

        <div className={'h-96'}>

          <model-viewer
            autoplay
            style={{ width: '100%', height: '100%' }}
            id={nft?.tokenId}
            alt={nft?.name + nft?.tokenId}
            src={nft?.animation_url}
            auto-rotate
            camera-controls
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
          // ios-src={}
          />
        </div>
      )}

      {/* {type === 'application' && (
        <PdfViewer fileUrl={nft.animation_url}/>
      )} */}

      <div className={'absolute top-2 right-2 flex pt-100%'}>

      </div>
    </div>
  )
}

export default ImageWithActions
