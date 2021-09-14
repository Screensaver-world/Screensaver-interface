/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'
import { shortenAddress, getSigner } from '../utils'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { gql, useLazyQuery } from '@apollo/client'
import makeBlockie from 'ethereum-blockies-base64'
import { SearchIcon } from '@heroicons/react/outline'
import useAxios from 'axios-hooks'
import classNames from 'classnames'
import NFT from '../types'

interface Props {
  address: string
  link: string
}

interface IProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const SEARCH_QUERY = gql`
  query SearchPage($text: String) {
    artworkSearch(text: $text
        first: 48
        skip: 0
        orderBy: creationDate
        orderDirection: desc
        where: { burned: false}
      ) {
      id
      name
      mediaUri
      creator {
        id
      }
      tokenId
    }
  }
`

const SearchModal: React.VFC<IProps> = ({ open, setOpen }) => {
  const { account, chainId } = useWeb3React<Web3Provider>()
  const [searchInput, setSearchInput] = useState('')
  const [users, setUsers] = useState([])
  const [nfts, setNFTs] = useState< NFT[] >([])
  const [state, setState] = useState<'creators' | 'NFTs'>('creators')

  const [
    { data: dataCreators, loading: loadingCreators, error: errorCreators },
    refetch,
  ] = useAxios(
    `https://us-central1-proofoftwitter.cloudfunctions.net/api/address/?user=${searchInput}`,
  )

  const [
    loadCollection,
    { called, error: errorNFTs, loading: loadingNFTs, data: dataNFTs },
  ] = useLazyQuery(SEARCH_QUERY, {
    variables: { text: searchInput },
  })

  useEffect(() => {
    setUsers([])
    setNFTs([])
  }, [state])

  useEffect(() => {
    if (state === 'creators') {
      refetch()
    } else {
      console.log(searchInput)
      loadCollection()
    }
  }, [searchInput])

  useEffect(() => {
    console.log("NFTS", dataNFTs?.artworkSearch)

    if (!dataNFTs?.artworkSearch) {
      setNFTs([])
      return
    }

    console.log("NFTS", dataNFTs?.artworkSearch)

    setNFTs(dataNFTs.artworkSearch)
  }, [dataNFTs])

  useEffect(() => {
    if (!dataCreators?.twitterId || !dataCreators?.verified || !dataCreators) {
      setUsers([])
      return
    }

    setUsers([dataCreators])
  }, [dataCreators])

  useEffect(() => {
    if (!dataCreators?.twitterId || !dataCreators?.verified || !dataCreators) {
      setUsers([])
      return
    }

    setUsers([dataCreators])
  }, [dataCreators])

  if (errorCreators || errorNFTs) return <p>Error!</p>

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        open={open}
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block transform transition-all sm:my-8 sm:align-middle w-full sm:max-w-sm">
              {/* <button
                type="button"
                className="inline-flex justify-center px-2 py-1 text-sm font-medium text-gray-200 bg-gray-900 border border-transparent rounded hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                onClick={() => setOpen(false)}
              >
                X
              </button> */}
              <div className="min-w-0 w-full flex-1 lg:px-0 xl:col-span-6">
                <div className="flex items-center py-4 lg:max-w-none lg:mx-0 xl:px-0">
                  <div className="w-full">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <SearchIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        id="search"
                        name="search"
                        className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Search"
                        type="search"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={
                  'h-96 flex flex-col items-start align-bottom bg-white rounded-md pt-5 pb-4 text-center overflow-hidden shadow-xl sm:w-full sm:p-2'
                }
              >
                <div className="relative z-0 w-full border-b border-gray-700 flex justify-start ">
                  <button
                    type="button"
                    onClick={() => setState('creators')}
                    className={classNames(
                      state === 'creators'
                        ? 'border-black font-medium'
                        : 'border-transparent',
                      'text-black relative inline-flex items-center px-4 py-2 border-b-2 text-sm font-light hover:font-bold focus:z-10 focus:outline-none outline-none',
                    )}
                  >
                    Creators
                  </button>
                  <button
                    type="button"
                    onClick={() => setState('NFTs')}
                    className={classNames(
                      state === 'NFTs'
                        ? 'border-black font-medium'
                        : 'border-transparent',
                      'text-black relative inline-flex items-center px-4 py-2 border-b-2 text-sm font-light hover:font-bold focus:z-10 focus:outline-none outline-none',
                    )}
                  >
                    NFTs
                  </button>
                </div>
                <div>
                  {state === 'creators' &&
                    (loadingCreators
                      ? [1, 2, 3].map((i, key) => (
                          <tr key={key}>
                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                              <div className="flex items-center space-x-5">
                                {/* <div className="flex-shrink-0 h-10 w-10"> */}
                                <div
                                  className={
                                    'h-8 w-8 rounded-full focus:outline-none'
                                  }
                                />
                                {/* </div> */}
                                <div className="ml-4">
                                  <div className="text-sm font-medium bg-gray-800"></div>
                                  {/* <div className="text-sm text-gray-500">{user.verified}</div> */}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      : users.map((user) => (
                          <tr key={user.twitterId}>
                            <Link href={`/created/${user.verified}`}>
                              <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                                <div className="flex items-center space-x-5">
                                  {/* <div className="flex-shrink-0 h-10 w-10"> */}
                                  <div
                                    className={
                                      'h-8 w-8 rounded-full focus:outline-none hover:shadow-white'
                                    }
                                  >
                                    <img
                                      style={{ borderRadius: '50%' }}
                                      src={makeBlockie(user.verified)}
                                    />
                                  </div>
                                  {/* </div> */}
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.twitterId}
                                    </div>
                                    {/* <div className="text-sm text-gray-500">{user.verified}</div> */}
                                  </div>
                                </div>
                              </td>
                            </Link>
                          </tr>
                        )))}

                  {state === 'NFTs' &&
                    (loadingNFTs
                      ? [1, 2, 3].map((i, key) => (
                          <tr key={key}>
                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                              <div className="flex items-center space-x-5">
                                {/* <div className="flex-shrink-0 h-10 w-10"> */}
                                <div
                                  className={
                                    'h-8 w-8 rounded-full focus:outline-none'
                                  }
                                />
                                {/* </div> */}
                                <div className="ml-4">
                                  <div className="text-sm font-medium bg-gray-800"></div>
                                  {/* <div className="text-sm text-gray-500">{user.verified}</div> */}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      : 
                      nfts.map((nft) => (
                          <tr key={nft.tokenId + nft.name}>
                            <Link href={`/object/${nft.tokenId}`}>
                              <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                                <div className="flex items-center space-x-5">
                                  {/* <div className="flex-shrink-0 h-10 w-10"> */}
                                  <div
                                    className={
                                      'h-8 w-8 rounded-full focus:outline-none hover:shadow-white'
                                    }
                                  >
                                    <img
                                      src={nft.thumbnail}
                                      className={'w-full'} 
                                    />
                                  </div>
                                  {/* </div> */}
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {nft.name}
                                    </div>
                                    {/* <div className="text-sm text-gray-500">{user.verified}</div> */}
                                  </div>
                                </div>
                              </td>
                            </Link>
                          </tr>
                        )))}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default SearchModal
