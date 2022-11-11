import React, { useState, useEffect } from 'react'
// import ActionButton from './ActionButton'
import VideoPlayer from '../MediaViewer/VideoPlayer'
import AudioPlayer from '../MediaViewer/AudioPlayer'

const ImageWithActions = ({nft}) => {
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('NFT IMAGE', nft)

    if (!nft?.mimeType) return
    const typeArray = nft?.mimeType.split('/')
    setType(typeArray[0])
  }, [nft])

  return (
    <div className={'min-h-96'}>
      {type === '' && <div>Loading...</div>}
      {/* { type && <iframe className={'w-full h-96 '} src={nft.animation_url}></iframe>} */}
      {type === 'image' && (
          <div className='pb-[100%] w-full relative'>
          <img src={nft.mediaUri} className={'absolute top-0 left-0 w-full h-full object-cover'} style={{ display: !loading ? 'block' : 'none' }} onLoad={() => setLoading(false)} />

          {loading && <div className="absolute top-0 left-0 h-full w-full bg-gray-800 animate-pulse" />}
        </div>
      )}
      {type === 'video' && (
        <VideoPlayer fileUrl={nft.mediaUri} />
      )}
      {type === 'audio' && (
        <AudioPlayer fileUrl={nft.mediaUri} coverImageUrl={nft?.thumbnail} />
      )}
      {(type === 'model' || nft?.mimeType === 'application/octet-stream') && (

        <div className={'h-96'}>

          <model-viewer
            autoplay
            style={{ width: '100%', height: '100%' }}
            id={nft?.tokenId}
            alt={nft?.name + nft?.tokenId}
            src={nft?.mediaUri}
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
