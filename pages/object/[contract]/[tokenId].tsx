import React, { useEffect, useState } from 'react'
import { Layout } from '../../../components'
import { useRouter } from 'next/router'
import ItemDetailView from '../ItemDetailView'
import axios from 'axios'
import BiddingDetailView from '../BiddingDetailView'
import BidHistory from '../BidHistory'
import Head from 'next/head'
import Error from '../../../components/Error'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { db, auth } from '../../../config/firebase'
import { useGalleryContract } from '../../../hooks/useContract'

type NFT = {
  name: string
  description: string
  creator: string
  creationDate: Date
  image: string
  animation_url: string
  metadataUri: string
  mediaUri: string
  mimeType: string
  size: string
  media: {
    mimeType: string
    size: string
  },
  tags: string[]
  tokenId: number
}

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
  const { tokenId, preview, contract } = router.query
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
  const galleryContract = useGalleryContract(contract.toString());

  useEffect(() => {
    const unregisterAuthObserver = auth().onAuthStateChanged((user) => {
      setIsSignedIn(!!user)
    })
    return () => unregisterAuthObserver()
  }, [])

  // ownerOf
  async function checkOwnerOf() {
    try {
      var ownerOf = await galleryContract.ownerOf(tokenId)
      var contractOwner = await galleryContract.owner()
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
    console.log("METADATA", tempMetadata)
  }

  async function getUri() {
    try {
      setUriError(null)
      console.log("TOKEN ID", tokenId, galleryContract)
      var tokenUri = await galleryContract.tokenURI(tokenId)
      setUri(tokenUri)
    } catch (error) {
      console.log('error', error)
      setUriError(error)
    }
  }

  useEffect(() => {
    if (!uri) return
    console.log('URI', uri)
    getMetadata()
  }, [uri])

  useEffect(() => {
    console.log("METADATA", metadata)
    if (!metadata) return
    setLoading(false)
  }, [metadata])

  useEffect(() => {
    if (!tokenId) return
    if (!!preview) {
      // add footer
      setUri('https://screensaver.mypinata.cloud/ipfs/' + preview.toString())
      setIsPreview(true)
    } else {
      getUri()
    }
  }, [tokenId, preview, galleryContract])

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
            content={`https://www.screensaver.world/object/0x486ca491C9A0a9ACE266AA100976bfefC57A0Dd4/${tokenId}`}
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
