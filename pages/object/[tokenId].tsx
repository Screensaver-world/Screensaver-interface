import React, { useEffect, useState } from 'react'
import { Layout } from '../../components'
import { useRouter } from 'next/router'
import ItemDetailView from '../../components/ItemDetailView'
import axios from 'axios'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../../constants/gallery'
import { getNetworkLibrary } from '../../connectors'
import NFT from '../../types'
import BiddingDetailView from '../../components/BiddingDetailView'
import BidHistory from '../../components/BidHistory'
import Head from 'next/head'
import Error from '../../components/Error'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { db, auth } from '../../config/firebase'

const ReportItem = ({ report }) => {
  return (
    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-medium text-gray-500">{`Reported ${report.created.toDate()}`}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {report.report}
      </dd>
    </div>
  )
}

const ItemDetailPage: React.VFC = () => {
  const { account } = useWeb3React<Web3Provider>()
  const router = useRouter()
  const { tokenId, preview } = router.query
  const [uri, setUri] = useState<undefined | string>()
  const [uriError, setUriError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [metadata, setMetadata] = useState<NFT | undefined>()
  const [reports, setReports] = useState<string[]>([])
  const [isPreview, setIsPreview] = useState(false)
  const [ownerOf, setOwnerOf] = useState<boolean>(false)
  const [isContractOwner, setIsContractOwner] = useState<boolean>(false)
  const [reportStatus, setReportStatus] = useState<string>('')
  const [isSignedIn, setIsSignedIn] = useState(false) // Local signed-in state.

  useEffect(() => {
    const unregisterAuthObserver = auth().onAuthStateChanged((user) => {
      setIsSignedIn(!!user)
    })
    return () => unregisterAuthObserver()
  }, [])

  // ownerOf
  async function checkOwnerOf() {
    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ID,
        GALLERY_ABI,
        getNetworkLibrary(),
      )

      var ownerOf = await contract.ownerOf(tokenId)
      var contractOwner = await contract.owner()

      const accountIsContractOwner = contractOwner === account

      setIsContractOwner(accountIsContractOwner)

      if (ownerOf !== account) return

      setOwnerOf(true)
    } catch (error) {
      console.log('error')
      setOwnerOf(false)
    }
  }

  function getReports(tokenId) {
    db.collection('reported')
      .doc(tokenId)
      .get()
      .then((doc) => {
        if (!doc.exists) return
        if (!doc?.data().tickets) return
        setReports(doc?.data().tickets)
        if (!doc?.data().status) return
        setReportStatus(doc?.data().status)
      })
  }

  useEffect(() => {
    if (!tokenId) return
    getReports(tokenId)
  }, [tokenId])

  useEffect(() => {
    checkOwnerOf()
  }, [account])

  async function getMetadataFromUri(uri) {
    console.log("HERE")

    if (uri.includes(undefined)) return null
    var metadata = await axios.get(uri.replace('https://ipfs.io', 'https://screensaver.mypinata.cloud'))
    console.log(metadata)
    var itemFromContract: NFT = {
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
  console.log("MEDIA DATA",  metadata.data)

    itemFromContract.name = metadata.data.name
    itemFromContract.description = metadata.data.description
    itemFromContract.creator.id
    itemFromContract.mimeType = metadata.data.media.mimeType
    itemFromContract.tokenId = metadata.data.id
    itemFromContract.creator.id = metadata.data.creator
    itemFromContract.image = metadata.data.image

    if (!!metadata.data.image) {
      itemFromContract.thumbnail = metadata.data.image
      itemFromContract.mediaUri = metadata.data.image
      itemFromContract.thumbnail.replace('https://ipfs.io', 'https://screensaver.mypinata.cloud')  
    }

    if (!!metadata.data.animation_url) {
      itemFromContract.mediaUri = metadata.data.animation_url
    }

    itemFromContract.mediaUri.replace('https://ipfs.io', 'https://screensaver.mypinata.cloud')


    console.log(itemFromContract)
    setMetadata(itemFromContract)
  }

  async function getUri() {
    try {
      setUriError(null)
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ID,
        GALLERY_ABI,
        getNetworkLibrary(),
      )
      var tokenUri = await contract.tokenURI(tokenId)
      console.log("HERE", tokenUri)
      setUri(tokenUri)
    } catch (error) {
      console.log('error', error)
      setUriError(error)
    }
  }

  useEffect(() => {
    if (!uri) return
    console.log('THIS IS URI', uri)
    getMetadataFromUri(uri)
  }, [uri])

  useEffect(() => {
    console.log("METADATA RETURNED", metadata)
    if (!metadata) return
    setLoading(false)
  }, [metadata])

  useEffect(() => {
    console.log("HERE WE GO", tokenId)

    if (!tokenId) return
    if (!!preview) {
      // add footer
      setUri('https://screensaver.mypinata.cloud/ipfs/' + preview.toString())
      setIsPreview(true)
    } else {
      console.log("HERE WE GO")
      getUri()
    }
  }, [tokenId, preview])

  if (uriError) {
    return (
      <Layout>
        <Error message="There was an error loading this object." />
      </Layout>
    )
  }

  if (loading)
    return (
      <Layout>
        <div className={'md:mt-12 pb-8 max-w-xl mx-auto'}>Loading...</div>
      </Layout>
    )

  return (
    <>
      <Layout>
        <Head>
          <title>Screensaver.world | Object #{tokenId}</title>
          <meta name="title" content={metadata.name} />
          <meta name="description" content={metadata.description} />
          <meta property="og:title" content={metadata.name} />
          <meta property="og:image" content={!!metadata.image && metadata.image}/>
          <meta property="og:description" content={metadata.description} />
          <meta
            property="og:url"
            content={`https://www.screensaver.world/object/${tokenId}`}
          />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>

        <div className={'mt-12 pb-8 w-11/12 mx-auto'}>
          <div className={'md:p-3 max-w-xl mx-auto min-h-screen'}>
            <ItemDetailView metadata={metadata} hash={preview?.toString()} />

            {!preview && !!tokenId && <BiddingDetailView tokenId={tokenId} />}

            {isSignedIn && (
              <>
                <div className="bg-white shadow p-2 text-black sm:rounded-lg mt-10">
                  {`Report Status: ${reportStatus}`}
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-10">
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    {reports.map((report, key) => (
                      <ReportItem report={report} key={key} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {!preview && <BidHistory tokenId={tokenId} />}

          </div>
        </div>
      </Layout>
    </>
  )
}

export default ItemDetailPage
