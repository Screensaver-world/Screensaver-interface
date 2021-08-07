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
import ReactPaginate from 'react-paginate-next'
import { gql, useLazyQuery } from '@apollo/client'
import { db } from '../config/firebase'

interface IProps {
  created?: boolean
  owned?: boolean
  admin?: boolean
}

const GALLERY_QUERY = gql`
  query Gallery($ids: [Int]) {
    artworks(where: {id_in: $ids, burned: false}) {
      id
      mimeType
      tokenId
      tagsString
      currentBid {
        id
        bidder {
          id
        }
        amount
        accepted
        canceled
        timestamp
      }
      description
      name
      mediaUri
      forSale
      creator {
        id
      }
      owner {
        id
      }
    }
  }
`
const ExploreView: React.VFC<IProps> = ({ created, owned, admin }) => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [ids, setIds] = useState<number[] | undefined>()
  const router = useRouter()
  const { account, page } = router.query
  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [count] = useState<number>(12)
  const [pageCount, setPageCount] = useState< number | null>(null)

  const [loadGallery, { called, error, loading, data }] = useLazyQuery(
    GALLERY_QUERY,
    {
      variables: { ids: ids },
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
    if (!!admin || !page) return
    getPageCount()
  }, [page])

  useEffect(() => {
    if (!data) return
    const artworks = [...data.artworks]
    const sortedArtworks = artworks.sort((a, b) => b.tokenId - a.tokenId)
    setNfts(sortedArtworks)
  }, [data])

  async function getPageCount() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )

    var minted = await contract.totalMinted()
    var total_minted = minted.toNumber()
    var page_count = Math.ceil(total_minted / count)

    loadTokens(total_minted)
    setPageCount(page_count === 0 ? 1 : page_count)

  }

  useEffect(() => {
    if (!ids) return;
    console.log(ids)
    loadGallery()
  }, [ids])

  useEffect(() => {
    console.log("DATA", data)
  }, [data])

  async function loadTokens(total_minted) {

    setLoadingState(true)

    let pageNumber = 1
    
    if (!!page) {
      pageNumber = parseInt(page.toString())
    }

    let minus =  pageNumber * count
    let lowRange = total_minted - minus

    if (lowRange > total_minted ) {
      lowRange = 0
    }

    const result = new Array(count).fill(true).map((e, i) => i + 1 + lowRange)

    const filteredResults = result.filter((i) => i > 0)
    setIds(filteredResults)
    
  }

  const getNFTs = async (range: number[]) => {

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )

    var allMetadata = await Promise.all(
      range.map(async (id) => {
        try {
          console.log("HERE")
          var uri = await contract.tokenURI(id)
          console.log("URI", uri)
          if (uri.includes(undefined)) return null
          var metadata = await axios.get(uri)
          metadata.data.tokenId = id
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

  if (loading || !nfts)
    return (
      <Layout>
        <div className={'md:mt-12 pb-8 max-w-xl mx-auto'}>loading...</div>
      </Layout>
    )

  return (
      <div className={'flex flex-col space-y-4'}>
        <div
          className={'grid gap-6 md:grid-cols-2 lg:grid-cols-3 mx-2 sm:mx-auto mt-48 md:mt-36'}
        >
          {(!loading) ? (
            nfts.map((item, key) => (
              <div key={key}>
                <NFTItemCard
                  nft={item}
                  title={item?.name}
                  coverImageSrc={item?.mediaUri}
                  creator={item?.creator.id}
                  endDateTime={new Date('1/1/count00')}
                  amountCollected={count}
                  tokenId={item?.tokenId}
                />
              </div>
            ))
          ) : (
            <NFTItemCard cardLoading={true} />
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
              marginPagesDisplayed={2}
              pageRangeDisplayed={1}
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
  )
}

export default ExploreView
