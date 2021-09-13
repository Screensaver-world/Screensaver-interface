import { useState, useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../constants/gallery'
import Modal from '../components/Modal'
import { getNetworkLibrary } from '../connectors'
import AccountId from './AccountId'
import SetSalePrice from './SetSalePrice'

var utils = require('ethers').utils

// TODO: setQuantity
interface IProps {
  tokenId: string
}

const BidRow: React.VFC<IProps> = ({ tokenId }) => {
  const { chainId, account, library } = useWeb3React<Web3Provider>()
  const [ownerOf, setOwnerOf] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [salePrice, setSalePrice] = useState<number>(0)

  // ownerOf
  async function checkOwnerOf() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID_ARB,
      GALLERY_ABI,
      getNetworkLibrary(),
    )
    var ownerOf = await contract.ownerOf(tokenId)

    console.log('Owner of', ownerOf)

    if (ownerOf !== account) return

    setOwnerOf(true)
  }

  // get sale price
  async function getSalePrice() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID_ARB,
      GALLERY_ABI,
      getNetworkLibrary(),
    )
    var tokenPrice = await contract.tokenPrice(tokenId)

    console.log('Token Price', tokenPrice)

    if (utils.formatEther(tokenPrice) === '0.0') {
      setSalePrice(0)
    } else {
      setSalePrice(utils.formatEther(tokenPrice))
    }
  }

  // remove from sale
  async function buyNow() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID_ARB,
      GALLERY_ABI,
      library.getSigner(account),
    )

    const big = utils.parseEther(salePrice)
    console.log('VALUE AT CREATE BID CALL', salePrice, big)
    let overrides = {
      // To convert Ether to Wei:
      value: utils.parseEther(salePrice)// ether in this case MUST be a string
    }

    // Pass in the overrides as the 3rd parameter to your 2-parameter function:

    const tx = await contract.buy(tokenId.toString(), overrides)

    setLoading(true)

    await tx.wait()

    setLoading(false)
  }

  // remove from sale
  async function removeFromSale() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID_ARB,
      GALLERY_ABI,
      library.getSigner(account),
    )

    // Pass in the overrides as the 3rd parameter to your 2-parameter function:

    const tx = await contract.setWeiSalePrice(tokenId.toString(), '0')

    setLoading(true)

    const receipt = await tx.wait()

    setLoading(false)

  }

  // component mount check for current bid
  useEffect(() => {
    checkOwnerOf()
    getSalePrice()
  }, [account])

  // if no bid do not show this coomponent

  return (
    <>
      <Modal
        status={chainId !== 137 ? 'switch-network' : 'connect'}
        open={open}
        setOpen={setOpen}
      />

      {/* set sale price */}

      {salePrice !== 0 && (
        <div className="my-6">
          <div className="rounded-md px-6 py-5 flex items-center justify-between border-2 border-gray-700">
                <h3 className="text-lg font-medium">
                  {salePrice} MATIC
                </h3>
            {/** if owner of token : accept , if bidder : cancel, if neither or if bidder : place bid*/}
            {!ownerOf ? (
              <button
                onClick={!!account ? buyNow : () => setOpen(true)}
                className="w-36 md:w-48 h-14 justify-center inline-flex items-center border border-red-300 shadow-sm text-red-300 font-medium rounded-full text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Buy Now
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
            ) : (
              <button
                onClick={!!account ? removeFromSale : () => setOpen(true)}
                className="w-48 h-14 justify-center inline-flex items-center border border-red-300 shadow-sm text-red-300 font-medium rounded-full text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Remove Sale
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
            )}
          </div>
        </div>
      )}

      {ownerOf && (
        <SetSalePrice sale={false} tokenId={tokenId} onUpdate={getSalePrice} />
      )}
    </>
  )
}

export default BidRow
