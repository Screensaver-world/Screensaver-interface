// TODO: setQuantity
import React, { useState, useEffect } from 'react'
import { storage } from '../config/firebase'
import axios from 'axios'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../constants/gallery'
import Modal from './Modal'
import classNames from 'classnames'
import { injected } from '../connectors'
import { useRouter } from 'next/router'
import { shortenAddress } from '../utils'
import { getNetworkLibrary } from '../connectors'
import { useMaticBalance } from '../hooks/useMaticBalance'
import { BigNumber } from 'ethers'
const utils = require('ethers').utils

interface IProps {
  onUpdate: () => void
  sale: boolean
  tokenId: string
}
const SetSalePrice: React.VFC<IProps> = ({
  onUpdate,
  tokenId,
  sale = true,
}) => {
  const [value, setValue] = useState<string>()
  const {
    chainId,
    account,
    activate,
    active,
    deactivate,
    library,
  } = useWeb3React<Web3Provider>()
  const [loading, setLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const maticBalance = useMaticBalance()

  const handleSubmit = (evt) => {
    evt.preventDefault()
    // contract call
    console.log('VALUE', value)
  }

  // accept active bid
  async function setSalePrice() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      library.getSigner(account),
    )

    // Pass in the overrides as the 3rd parameter to your 2-parameter function:

    const tx = await contract.setWeiSalePrice(tokenId.toString(), utils.parseEther(value))

    setLoading(true)

    const receipt = await tx.wait()

    onUpdate()
    setLoading(false)
  }

  return (
    <div className={'flex flex-col space-y-3 mb-6'}>
      <Modal
        status={chainId !== 137 ? 'switch-network' : 'connect'}
        open={open}
        setOpen={setOpen}
      />
      <label
        htmlFor="number"
        className="block text-sm font-medium text-white mt-8"
      >
        {sale
          ? 'Sale Price'
          : account && `Balance: ${maticBalance.toFixed(3)} MATIC`}
      </label>
      <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
        <div className="w-full sm:max-w-xs">
          <div className=" flex rounded-md shadow-sm">
            <input
              type="number"
              name="number"
              id="number"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-2xl border-gray-300 rounded-l-sm bg-gray-900"
              placeholder="0.1"
              min="0.000000000000000001"
              step="0.000000000000000001"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <span className="inline-flex items-center px-6 rounded-r-sm border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              MATIC
            </span>
          </div>
        </div>
        
          <button
            onClick={account ? setSalePrice : () => setOpen(true)}
            className="button mt-3 md:mt-0 md:ml-3 w-full md:w-1/2 justify-center inline-flex items-center px-6 py-3 border border-red-300 shadow-sm text-red-300 font-medium rounded-xs text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
           
          >
            Set Fixed Price
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
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
          </button>
      </form>

    </div>
  )
}

export default SetSalePrice