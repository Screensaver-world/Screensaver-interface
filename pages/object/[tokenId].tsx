import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { Layout } from '../../components'
import { useRouter } from 'next/router'
import ItemDetailView from './ItemDetailView'
import AccountId from '../../components/AccountId'
import axios from 'axios'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../../constants/gallery'
import { getNetworkLibrary } from '../../connectors'
import MintButton from '../../components/MintButton'
import NFT from '../../types'
import BiddingDetailView from './BiddingDetailView'
import Head from 'next/head'
import ReportButton from '../../components/ReportButton'
import BurnButton from '../../components/BurnButton'
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
      console.log('SIGN UP', user)
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

  async function getMetadata() {
    var meta = await axios.get(uri)
    var tempMetadata = meta.data
    tempMetadata.metadataUri = uri
    tempMetadata.creationDate = new Date(meta.data.creationDate).toString()
    setMetadata(tempMetadata)
  }

  async function getUri() {
    try {
      setUriError(null);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ID,
        GALLERY_ABI,
        getNetworkLibrary(),
      )
      var tokenUri = await contract.tokenURI(tokenId)
      setUri(tokenUri)
    } catch(error) {
      console.log("error", error)
      setUriError(error);
    }

  }

  useEffect(() => {
    if (!uri) return
    console.log('URI', uri)
    getMetadata()
  }, [uri])

  useEffect(() => {
    console.log(metadata)
    if (!metadata) return
    setLoading(false)
  }, [metadata])

  useEffect(() => {
    if (!tokenId) return
    if (!!preview) {
      // add footer
      setUri('https://ipfs.io/ipfs/' + preview.toString())
      setIsPreview(true)
    } else {
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
          <meta property="og:image" content={metadata.image} />
          <meta property="og:description" content={metadata.description} />
          <meta
            property="og:url"
            content={`https://www.screensaver.world/object/${tokenId}`}
          />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>

        <div className="grid md:grid-cols-2 xs:grid-cols-1">
          <div>
            <ItemDetailView
              metadata={metadata}
              hash={preview?.toString()}
            />
          </div>
          <div>
            <div className={'text-red-400'}>
              OBJ: #{tokenId}
            </div>
            <div className={'text-4xl font-bold mt-3 mb-1 md:mt-12 mt-8'}>{metadata.name}</div>
            <div className={'text-md flex w-full'}>
              {/* TODO: swear to god lisa if you add the space character to add margin*/}
              <strong>CREATOR &nbsp;</strong> <AccountId linkToCreated address={metadata.creator} />
            </div>
            {(!preview && !!tokenId) && <BiddingDetailView tokenId={tokenId} />}
            <div className={'text-xl mt-4 mb-6'}>
              <strong></strong>
              {metadata.description}
            </div>
            <div className={'flex flex-col space-y-8'}>
              <div className={'px-3'}>
                {!!preview && <MintButton hash={hash} />}

                <div className={'w-full border-t border-gray-800'} />

                <div className={'text-lg py-1 mt-3'}>
                  <strong>Creator: </strong> <AccountId linkToCreated address={metadata.creator} />
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
            


            {!preview && (<div className={'flex w-full mt-6'}>
              {(isContractOwner || ownerOf) && <BurnButton />}
              <ReportButton />
            </div>)}

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

            <div>METADATA URI: {!!metadata?.metadataUri && metadata.metadataUri.split('https://ipfs.io/ipfs/')[1]}</div>
            {!!metadata.image && <div>{`MEDIA URI:${metadata.image.split('https://ipfs.io/ipfs/')[1]}`}</div>}
            {!!metadata.animation_url && <div>{`MEDIA URI: ${metadata.animation_url.split('https://ipfs.io/ipfs/')[1]}`}</div>}
        </div>
      </Layout>
    </>
  )
}

export default ItemDetailPage
