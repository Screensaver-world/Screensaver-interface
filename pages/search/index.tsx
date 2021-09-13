import React, { useState, useEffect } from 'react'
import NFTItemCard from '../../components/NFTItemCard'
import { Layout } from '../../components'
import axios from 'axios'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../../constants/gallery'
import { getNetworkLibrary } from '../../connectors'
import NFT from '../../types'
import { gql, useLazyQuery } from '@apollo/client'
import { db } from '../../config/firebase'
import SearchBar from '../../components/SearchBar'

interface IProps {
  created?: boolean
  owned?: boolean
  admin?: boolean
}

const SEARCH_QUERY = gql`
  query SearchPage($text: String) {
    artworkSearch(text: $text) {
      id
      }
  }
`

const SearchView: React.VFC<IProps> = ({ created, owned, admin }) => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [count] = useState<number>(12)
  const [searchInput, setSearchInput] = useState('')

  const [loadCollection, { called, error, loading, data }] = useLazyQuery(
    SEARCH_QUERY,
    {
      variables: { text: searchInput },
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

  useEffect(() => {
    if (!data) return
    getCollectionIds(data)
  }, [data])

  useEffect(() => {
    loadCollection()
  }, [searchInput])

  async function getCollectionIds(data) {

    let ids = data.artworkSearch.map(a => a.id)

    let filteredIds = ids.filter((v, i) => ids.indexOf(v) === i)
    let ascending = filteredIds.sort(function (a, b) {
      return a - b
    })

    await getNFTs(ascending)

    setLoadingState(false)
  }

  const getNFTs = async (range: number[]) => {

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID_ARB,
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

  return (
    <Layout>

      <div className={'flex flex-col space-y-4 items-center mt-48'}>
        <SearchBar input={searchInput} onChange={value => setSearchInput(value)}/> 
        <div
          className={'grid gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto mt-8'}
          
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


      </div>
      </Layout>
  )
}

export default SearchView
