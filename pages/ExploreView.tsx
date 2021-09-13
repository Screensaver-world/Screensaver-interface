import React, { useState, useEffect } from 'react'
import NFTItemCard from '../components/NFTItemCard'
import { Layout } from '../components'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../constants/gallery'
import { getNetworkLibrary } from '../connectors'
import NFT from '../types'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import AccountId from '../components/AccountId'
import ReactPaginate from 'react-paginate-next'
import { gql, useLazyQuery } from '@apollo/client'
import { db } from '../config/firebase'
import {
  useWindowWidth
} from '@react-hook/window-size'
import { useGalleryContract } from '../hooks/useContract'

interface IProps {
  created?: boolean
  owned?: boolean
  admin?: boolean
}

const GALLERY_QUERY = gql`
  query HomePage($id: String) {
    account(id: $id) {
      id
      address
      isWhitelisted
      created {
        id
      }
      items {
        id
      }
    }
  }
`
const ExploreView: React.VFC<IProps> = ({ created, owned, admin }) => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const router = useRouter()
  const { account, page } = router.query
  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [count] = useState<number>(12)
  const [pageCount, setPageCount] = useState< number | null>(null)
  const [totalSupply, setTotalSupply] = useState(0)
  const [totalMinted, setMintedSupply] = useState(0)
  const width = useWindowWidth()
  const [isMobile, setIsMobile] = useState(true)
  const galleryContract = useGalleryContract();

  // change pagination based on width
  useEffect(() => {
    if (width === null || !width) return;
    if (width >= 400) {
      setIsMobile(false)
    } else {
      setIsMobile(true)
    }
  }, [width])

  const [loadCollection, { called, error, loading, data }] = useLazyQuery(
    GALLERY_QUERY,
    {
      variables: { id: account?.toString()?.toLowerCase() },
    },
  )

  // check reports for
  useEffect(() => {
    if (!admin) return;
    const unsubscribe = db
      .collection('reported')
      .onSnapshot((reportsSnapshot) => {
        if (reportsSnapshot.empty) return
        let ids = []
        reportsSnapshot.forEach((doc) => {
          ids.push(parseInt(doc.id))
        })
        loadReports(ids)
      })
    return () => unsubscribe() // Make sure we un-register Firebase observers when the component unmounts.
  }, [])

  async function loadReports(ids: number[]) {
    setLoadingState(true)
    await getNFTs(ids)
    setLoadingState(false)
  }

  const next = () => {
    if (!page || parseInt(!!page && page.toString()) >= pageCount) return
    router.push(`?page=${parseInt(!!page && page.toString()) + 1}`)
  }

  const previous = () => {
    if (!page || parseInt(!!page && page.toString()) <= 1) return
    router.push(`?page=${parseInt(!!page && page.toString()) - 1}`)
  }

  const handlePageClick = (newPage: { selected: number }) => {
    router.push(`?page=${newPage.selected + 1}`)
  }

  useEffect(() => {
    if ((!created && !owned && !admin) || !account || !data) return
    getCollectionIds(data)
  }, [data])

  useEffect(() => {
    if ((!created && !owned && !admin) || !account) return
    loadCollection()
  }, [account])

  useEffect(() => {
    if (!!created || !!owned || !!admin || !page) return
    getPageCount()
  }, [page])

  async function getPageCount() {
    var supply = await galleryContract.totalSupply()
    var total_supply = supply.toNumber()
    var minted = await galleryContract.totalMinted()
    var total_minted = minted.toNumber()
    var page_count = Math.ceil(total_minted / count)
    loadTokens(total_minted)
    setTotalSupply(total_supply)
    setMintedSupply(total_minted)
    setPageCount(page_count === 0 ? 1 : page_count)

  }

  async function getCollectionIds(data) {
    let ids

    if (created) {
      ids = data.account?.created?.map((i) => i.id) ?? [];
    }

    if (owned) {
      ids = data.account?.items?.map((i) => i.id) ?? [];
    }

    let filteredIds = ids.filter((v, i) => ids.indexOf(v) === i)
    let ascending = filteredIds.sort(function (a, b) {
      return a - b
    })

    await getNFTs(ascending)

    setLoadingState(false)
  }

  async function loadTokens(total_minted) {

    console.log("PAGE NUMBER", page, "TOTAL MINTED", total_minted)

    setLoadingState(true)

    let pageNumber = 1
    
    if (!!page) {
      pageNumber = parseInt(page.toString())
    }

    let minus =  pageNumber * count
    let lowRange = total_minted - minus

    console.log("LOW RANGE", lowRange, total_minted)

    if (lowRange > total_minted ) {
      lowRange = 0
    }

    console.log("LOW RANGE", lowRange)

    const result = new Array(count).fill(true).map((e, i) => i + 1 + lowRange)

    const filteredResults = result.filter((i) => i > 0)

    console.log("FILTERED", filteredResults)

    await getNFTs(filteredResults)

    setLoadingState(false)
  }

  const getNFTs = async (range: number[]) => {

    var allMetadata = await Promise.all(
      range.map(async (id) => {
        try {
          console.log("HERE")
          var uri = await galleryContract.tokenURI(id)
          console.log("URI", uri)
          if (uri.includes(undefined)) return null
          var metadata = await axios.get(uri)
          metadata.data.tokenId = id
          metadata.data.creator = {id: metadata.data.creator}
          // var parsedMetadata: NFT = metadata.data
          // parsedMetadata.creator.id = metadata.data.creator
          if (!metadata.data.animation_url) {
            metadata.data.mediaUri = metadata.data.image
          } else {
            metadata.data.mediaUri = metadata.data.animation_url
          }

          metadata.data.mimeType = metadata.data.media.mimeType
          
          return metadata.data
        } catch (error) {
          console.log('ERROR getting token URI', error)
          return null
        }
      }),
    )

    const filteredMeta = allMetadata.filter((i) => i !== null)

    console.log("FILTERED METADATA", filteredMeta)
    setNfts(filteredMeta.reverse())
  }

  if (error) {
    return (
      <Layout>
        <div className={'md:mt-12 pb-8 max-w-xl mx-auto'}>{error}</div>
      </Layout>
    )
  }

  if (loadingState || loading)
    return (
      <Layout>
        <div className={'md:mt-12 pb-8 max-w-xl mx-auto'}>loading...</div>
      </Layout>
    )

  return (
    <>
      {created && (
        <div
          className={
            'flex items-center justify-center text-2xl font-light h-16'
          }
        >
          CREATED&nbsp; <AccountId address={account.toString()} link={'created'} />
        </div>
      )}
      {owned && (
        <div
          className={
            'flex items-center justify-center text-2xl font-light h-16'
          }
        >
          OWNED&nbsp; <AccountId address={account.toString()} link={'created'}/>
        </div>
      )}

      {nfts.length === 0 && (
        <div className="flex items-center justify-center text-md font-light h-12">
          This address has no {created ? 'created' : owned ? 'owned' : ''} objects.
        </div>
      )}

      <div className={'flex flex-col space-y-4'}>
        <div
          className={'grid gap-6 md:grid-cols-2 lg:grid-cols-3 mx-2 sm:mx-auto mt-48 md:mt-36'}
        >
          {(!loadingState && !loading) ? (
            nfts.map((item, key) => (
              <div key={key}>
                <NFTItemCard
                  nft={item}
                  tokenId={item?.tokenId}
                />
              </div>
            ))
          ) : (
            <NFTItemCard />
          )}
        </div>

        {!created && !owned && pageCount > 1 && (
          <div className={'flex'}>
            {!!page && parseInt(page.toString()) > 1 && (
              <button
                type="button"
                onClick={previous}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <ReactPaginate
              previousLabel={''}
              nextLabel={''}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={pageCount}
              marginPagesDisplayed={isMobile ? 2 : 2}
              pageRangeDisplayed={isMobile ? 1 : 2}
              onPageChange={handlePageClick}
              containerClassName={
                'flex w-full bg-red-400 justify-center items-center h-10'
              }
              pageLinkClassName={
                'flex justify-center items-center w-10 bg-white text-red-400 m-2 hover:cursor-pointer'
              }
              activeClassName={'active'}
            />

            {(!!page && parseInt(page.toString()) < pageCount) && (
              <button
                type="button"
                onClick={next}
                className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default ExploreView
