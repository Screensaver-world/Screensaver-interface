import { useState, useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import Modal from '../components/Modal'
import SetSalePrice from './SetSalePrice'
import {useGalleryContract} from '../hooks/useContract'

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
  const galleryContract = useGalleryContract();
  
  // ownerOf
  async function checkOwnerOf() {
    var ownerOf = await galleryContract.ownerOf(tokenId)
    if (ownerOf !== account) return
    setOwnerOf(true)
  }

  // get sale price
  async function getSalePrice() {
    var tokenPrice = await galleryContract.getTokenPrice(tokenId)
    if (utils.formatEther(tokenPrice) === '0.0') {
      setSalePrice(0)
    } else {
      setSalePrice(utils.formatEther(tokenPrice))
    }
  }

  // remove from sale
  async function buyNow() {
    let overrides = {
      // To convert Ether to Wei:
      value: utils.parseEther(salePrice)// ether in this case MUST be a string
    }
    const tx = await galleryContract.buy(tokenId.toString(), overrides)
    setLoading(true)
    await tx.wait()
    setLoading(false)
  }

  // remove from sale
  async function removeFromSale() {
    const tx = await galleryContract.setWeiSalePrice(tokenId.toString(), '0')
    setLoading(true)
    await tx.wait()
    setLoading(false)
  }

  // component mount check for current bid
  useEffect(() => {
    checkOwnerOf()
    getSalePrice()
  }, [account])

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
