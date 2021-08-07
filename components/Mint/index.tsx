import { useState, useEffect } from 'react'
import { storage } from '../../config/firebase'
import axios from 'axios'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import Modal from '../../components/Modal'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { parseTags } from '../../utils'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../../constants/gallery'
import { getNetworkLibrary } from '../../connectors'
import { Layout } from '../../components'

var uri = 'https://us-central1-broccoli-df8cd.cloudfunctions.net/api/mint'

export default function Mint() {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [media, setMedia] = useState<File>()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { chainId, account } = useWeb3React<Web3Provider>()
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [includeThumbnail, setIncludeThumbnail] = useState(false)
  const [whitelistedLoading, setWhitelistedLoading] = useState(true)
  const [thumbnailMedia, setThumbnailMedia] = useState<File>()

  // ownerOf
  async function checkIsWhitelisted() {
    setWhitelistedLoading(true)
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )
    var whitelistStatus = await contract.isWhitelisted(account)

    console.log('WHITELIST', whitelistStatus)
    setIsWhitelisted(whitelistStatus)
    setWhitelistedLoading(false)
  }

  useEffect(() => {
    checkIsWhitelisted()
  }, [])

  // check if file size is too large
  useEffect(() => {
    if (media?.type.includes('video') || media?.type.includes('audio')) {
      setIncludeThumbnail(true)
    }

    if (media?.size > 40000000) {
      return setError(true)
    }
  }, [media])

  // on preview button submit
  const submit = (evt) => {
    setError(false)
    evt.preventDefault()
    if (chainId !== 137) {
      setOpen(true)
    } else {
      tempFileUpload()
    }
  }

  // post metadata to server then to ipfs
  async function postMetadata(imageUrl: string, thumbnailUrl: string, mimeType: string) {
    var parsedTags = parseTags(tags)
    var creationDate = new Date()
    const metadata = {
      name: title,
      creationDate: new Date(),
      uri: imageUrl,
      thumbnailUrl: thumbnailUrl,
      description: description,
      media: {
        mimeType: mimeType,
        size: media.size,
      },
      tags: parsedTags,
      creator: account,
    }

    console.log('META', metadata)

    try {
      const metadataUri = await axios.post(uri, metadata)

      return metadataUri.data.uri
    } catch (error) {
      console.log('ERROR', error)
      throw new Error('error posting to ipfs')
    }
  }

  async function tempFileUpload() {
    setLoading(true)

    try {
      // Create a root reference
      var storageRef = storage().ref()
      var name = media.name

      // Create a reference to 'mountains.jpg'
      var fileRef = storageRef.child(name.split(' ').join('_'))

      // upload file to temp storage
      await fileRef.put(media)

      // get download url
      var downloadUrl = await fileRef.getDownloadURL()

      // get metadata of file to get file type
      const metadata = await fileRef.getMetadata()

      if (metadata.size > 40000000) {
        return setError(true)
      }

      let thumbnailDownloadUrl;

      if (includeThumbnail) {
        // Create a root reference
        var thumbnailStorageRef = storage().ref()
        var thumbnailName = thumbnailMedia.name
  
        // Create a reference to 'mountains.jpg'
        var thumbnailFileRef = thumbnailStorageRef.child(thumbnailName.split(' ').join('_'))
  
        // upload file to temp storage
        await thumbnailFileRef.put(thumbnailMedia)
  
        // get download url
        thumbnailDownloadUrl = await thumbnailFileRef.getDownloadURL()
  
        // get metadata of file to get file type
        const thumbnailMetadata = await thumbnailFileRef.getMetadata()

        if (thumbnailMetadata.size > 5000000 || !thumbnailMedia.type.includes('image')) {
          // console.log("HERE WE GO", thumbnailMetadata.size, thumbnailMedia, thumbnailMedia.type.includes('image'))
          return setError(true)
        }

      }

      // post metadata to server which will post to IPFS
      const uri = await postMetadata(downloadUrl, thumbnailDownloadUrl, metadata.contentType)

      // get hash from returned URI
      const hash = uri.split('/')

      // push to item page in preview mode with IPFS hash
      router.push(`/object/1?preview=${hash[hash.length - 1]}`)

      // return { mediaUrl: downloadUrl, mimeType: metadata.contentType }
    } catch (error) {
      console.log('ERROR', error)
    }

    setLoading(false)
  }

  if (!account) {
    return (
      <Layout>
        <div className={'md:mt-12 pb-8 max-w-xl mx-auto'}>
          Please connect your metamask to start minting.
        </div>{' '}
      </Layout>
    )
  }

  if (whitelistedLoading) {
    return (
      <Layout>
        <div className={'md:mt-12 pb-8 max-w-xl mx-auto'}>loading...</div>
      </Layout>
    )
  }

  if (!isWhitelisted) {
    return (
      <Layout>
        <div className={'md:mt-12 pb-8 max-w-xl mx-auto'}>
          Your account is not yet whitelisted. To become whitelisted please
          review and accept our Terms of Service. :)
        </div>
        <Link href="/whitelist">
          <button className="mt-4 w-full justify-center inline-flex items-center px-6 py-3 border border-red-300 shadow-sm text-red-300 font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Get Whitelisted
          </button>
        </Link>
      </Layout>
    )
  }

  return (
    <div>
      <Modal status={'switch-network'} open={open} setOpen={setOpen} />

      <form className="space-y-8 divide-y divide-gray-200" onSubmit={submit}>
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div>
            <div>
              <h3 className="mt-10 max-w-3xl text-3xl text-white font-bold">
                Mint
              </h3>
              <p className="mt-1 max-w-2xl text-md text-gray-100 font-medium">
                Creators will receive 15% royalties on all secondary sales within SSW and SSW takes a 
                5% marketplace fees on sales.
              </p>
            </div>

            <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                <label
                  htmlFor="cover_photo"
                  className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                >
                  Upload
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed">
                    {media ? (
                      <div>{media.name} ready!</div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="mt-4 w-full justify-center inline-flex items-center px-2 py-2 mb-2 border border-red-300 shadow-sm text-red-300 text-sm font-medium rounded-full text-red-300 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={(e) => setMedia(e.target.files[0])}
                            />
                          </label>
                        </div>
                        <p className="text-lg text-gray-500">
                          Upload .png, .jpg, .glb, .mp3, .mp4, .gif{' '}
                          <strong className={'text-xl'}>up to 40MB.</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {includeThumbnail && (
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                  <label
                    htmlFor="cover_photo"
                    className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                  >
                    Upload thumbnail
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed">
                      {thumbnailMedia ? (
                        <div>{thumbnailMedia.name} ready!</div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="mt-4 w-full justify-center inline-flex items-center px-2 py-2 mb-2 border border-red-300 shadow-sm text-red-300 text-sm font-medium rounded-full text-red-300 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              <span>Upload a thumbnail</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={(e) => setThumbnailMedia(e.target.files[0])}
                              />
                            </label>
                          </div>
                          <p className="text-lg text-gray-500">
                            Upload .png, .jpg{' '} as a thumbnail for audio or videos 
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className={'text-white text-md font-regular mt-3'}>
                {error && `File size too large! Keep in under 40MB please :).`}
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                >
                  Title
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex shadow-sm">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="flex-1 block w-full focus:ring-red-500 focus:border-red-500 min-w-0 sm:text-sm border-gray-700 bg-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                >
                  Description
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    className="max-w-lg shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border-gray-700  bg-gray-900"
                    defaultValue={''}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="mt-2 text-sm text-gray-300">
                    Write a few sentences about your work.
                  </p>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                >
                  Tags
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    placeholder={'music, experimental, jazz'}
                    className="max-w-lg h-12 shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border-gray-700 bg-gray-900"
                    defaultValue={''}
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <p className="mt-2 text-sm text-gray-300">
                    Add tags seperated by commas.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full justify-center inline-flex items-center px-6 py-3 border border-red-300 shadow-sm text-red-300 font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={!media || loading || error}
            >
              Preview
              {loading && (
                <svg
                  className="animate-spin -mr-1 ml-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </button>
            <div className={'text-white text-md font-regular mt-3'}>
              {error && `Error occured.`}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
