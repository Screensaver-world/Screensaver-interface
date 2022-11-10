import React, { useState } from 'react'
import Link from 'next/link'
import { IProps } from '../types'
import { MenuIcon } from '@heroicons/react/outline'
import { SearchIcon } from '@heroicons/react/outline'
import ConnectButton from '../../ConnectButton'
import Banner from '../../Banner'
import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import logoImage from '../../../assets/logo.png'
import { ethers } from 'ethers'
import { ERC20_ABI } from '../../../constants/abis/erc20'
import { auth } from '../../../config/firebase'
import { useRouter } from 'next/router'
import SearchModal from '../../SearchModal'
import { FaTwitter, FaDiscord } from 'react-icons/fa'

const utils = require('ethers').utils

const tokenAddress = '0x580127f3F17516A945785b9485048ad22f036142'

const addToMetamask = async (provider: any): Promise<void> => {
  await provider.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: { address: tokenAddress, symbol: 'SSD', decimals: 18 },
    },
  })
}

const MobileNavbar: React.FC<IProps> = () => {
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const { account, library, connector } = useWeb3React()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const router = useRouter()
  const [showBanner, setShowBanner] = useState(false)
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    const unregisterAuthObserver = auth().onAuthStateChanged((user) => {
      setIsSignedIn(!!user)
    })
    return () => unregisterAuthObserver()
  }, [])

  useEffect(() => {
    console.log('ROUTER', router.pathname)
    if (router.pathname.includes('gallery')) {
      setShowBanner(true)
    }
  }, [router])

  async function balanceOf() {
    const contract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      library.getSigner(account),
    )

    const balance = await contract.balanceOf(account)
    const intBalance = utils.formatEther(balance)
    setTokenBalance(Number(intBalance))
  }

  useEffect(() => {
    if (!account) return
    balanceOf()
  }, [account])

  const track = async () => {
    const provider = await connector.getProvider()
    return addToMetamask(provider)
  }

  return (
    <>
      {/* <SearchModal open={open} setOpen={setOpen} /> */}

      <div
        className={
          'fixed z-10 bg-black right-0 top-0 w-full h-16 backdrop-filter backdrop-blur-lg bg-opacity-30'
        }
      />
      <div className={'fixed z-10 bg-transparent right-0 top-0 w-full'}>
        <div className={'mw-auto'}>
          <div
            className={
              'justify-between max-w-8xl flex mx-auto w-11/12 items-center h-16 z-10'
            }
          >
            <div className={'flex items-center'}>
              <Link href={'/'} className="flex font-serif text-2xl text-red-400 font-bold mt-2">
                  <img
                    src={logoImage}
                    alt={'Screen Saver'}
                    className={'cursor-pointer'}
                    width={120}
                  />
              </Link>
            </div>

            <div className={'flex items-center space-x-2 md:space-x-3'}>
              {/* <SearchIcon
                onClick={() => setOpen(true)}
                className={'h-8 w-8 text-red-300 cursor-pointer'}
              /> */}

              <ConnectButton />

              <Menu as="div" className="relative z-20">
                {({ open }) => (
                  <>
                    <div>
                      <Menu.Button className="h-8 w-8 ml-1 p-1 focus:outline-none border border-red-200 rounded hover:bg-gray-500">
                        <span className="sr-only">Open user menu</span>

                        <MenuIcon className={' text-red-300'} />
                      </Menu.Button>
                    </div>
                    <Transition
                      show={open}
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        static
                        className="origin-top-right absolute right-4 mt-2 w-64 rounded py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        {/* <Menu.Item>
                        <Link href="/gallery">
                          <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Gallery
                          </a>
                        </Link>
                      </Menu.Item> */}
                        {/* <Menu.Item>
                        <Link href="/search">
                          <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Search
                          </a>
                        </Link>
                      </Menu.Item> */}
                        {/* <Menu.Item>
                        <Link href="/leaderboard">
                          <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Leaderboard
                          </a>
                        </Link>
                      </Menu.Item> */}

                        {!!account && (
                          <>
                            {/* <Menu.Item>
                            <Link href={`/created/${account}`}>
                              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Account
                              </a>
                            </Link>
                          </Menu.Item> */}
                            {/* <Menu.Item>
                            <Link href={`/owned/${account}`}>
                              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Owned
                              </a>
                            </Link>
                          </Menu.Item> */}
                          </>
                        )}

                        {/* Mint */}
                        <Menu.Item>
                          <Link href="/mint" className="block px-4 py-2 text-lg text-black font-bold hover:bg-gray-100">
                              🎨 Mint
                          </Link>
                        </Menu.Item>

                        {/* Buy Matic */}
                        <Menu.Item>
                          <Link href="https://buy.moonpay.com/" 
                              target="_blank"
                              className="block px-4 py-2 text-lg text-black font-bold hover:bg-gray-100"
                            >
                              💸 Buy
                          </Link>
                        </Menu.Item>

                        {/* About */}
                        <Menu.Item>
                          <Link href="https://docs.screensaver.world" className="block px-4 py-2 text-lg text-black font-bold hover:bg-gray-100">
                              🧅 Docs
                          </Link>
                        </Menu.Item>

                        {/* Account shortlinks */}
                        <Menu.Item>
                          <Link href="https://ssw.wtf/" 
                              target="_blank"
                              className="block px-4 py-2 text-lg text-black font-bold hover:bg-gray-100"
                            >
                              🚀 Shortlinks
                          </Link>
                        </Menu.Item>

                        {/* Discord */}
                        <Menu.Item>
                          <a
                            href="https://discord.gg/fAGHysxKux"
                            target="_blank"
                            className="inline-flex px-4 py-2 text-lg text-black font-bold hover:bg-gray-100 items-center" rel="noreferrer"
                          >
                            <FaDiscord className="mr-4 bg-black-500" /> Discord
                          </a>
                        </Menu.Item>

                        {/* Discord */}
                        <Menu.Item>
                          <a
                            href="https://twitter.com/screensavernft"
                            target="_blank"
                            className="inline-flex px-4 py-2 text-lg text-black font-bold hover:bg-gray-100 items-center" rel="noreferrer"
                          >
                            <FaTwitter className="mr-4 text-blue-500" /> Twitter
                          </a>
                        </Menu.Item>

                        <Menu.Item>
                          <Link href="/galleries" className="block px-4 py-2 text-lg text-white font-bold bg-green-400 hover:bg-gray-100">
                              Galleries BETA
                          </Link>
                        </Menu.Item>

                        {/* Screensaver V0 */}
                        <Menu.Item>
                          <a
                            href="https://v0.screensaver.world"
                            className="block px-4 py-2 text-lg text-white font-bold bg-red-200 hover:bg-gray-100"
                          >
                            SSWV0
                          </a>
                        </Menu.Item>

                        {isSignedIn && (
                          <Menu.Item>
                            <div
                              onClick={() => {
                                auth()
                                  .signOut()
                                  .then(() => {
                                    // Sign-out successful.
                                    console.log('SIGNOUT')
                                  })
                                  .catch((error) => {
                                    // An error happened.
                                    console.log('SIGNOUT ERROR', error)
                                  })
                              }}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Admin Logout
                            </div>
                          </Menu.Item>
                        )}
                      </Menu.Items>
                    </Transition>
                  </>
                )}
              </Menu>
            </div>
          </div>
        </div>
        {/* {showBanner && <Banner />} */}
      </div>
    </>
  )
}

export default MobileNavbar
