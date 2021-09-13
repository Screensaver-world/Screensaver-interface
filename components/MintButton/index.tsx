import React from 'react'
import { useState } from 'react'
import Modal from '../Modal'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useRouter } from 'next/router'
import {useGalleryContract} from '../../hooks/useContract'

interface IProps {
  hash: string
}

const index: React.FC<IProps> = ({ hash }) => {
  const [open, setOpen] = useState(false)
  const [initialSupply, setInitialSupply] = useState<number | null>(null)
  const [supply, setSupply] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const galleryContract = useGalleryContract();
  const router = useRouter()

  const { chainId, account, library } = useWeb3React<Web3Provider>()

  async function createToken(uri: string) {
    setLoading(true)
    let tx = await galleryContract.createToken(uri)
    await tx.wait();
    goToNFT()
  }

  async function goToNFT() {
    var supply = await galleryContract.totalMinted()
    var parsedSupply = supply.toNumber()
    router.push(`/object/${parsedSupply}`)
  }

  return (
    <>
      <Modal
        status={chainId !== 137 ? 'switch-network' : 'connect'}
        open={open}
        setOpen={setOpen}
      />

      <div className={'mr-2'}>
        <button
          disabled={loading}
          onClick={
            !account || chainId !== 137
              ? () => setOpen(true)
              : () => createToken(`https://ipfs.io/ipfs/${hash}`)
          }
          className="mt-4 w-full justify-center inline-flex items-center px-6 py-3 border border-red-300 shadow-sm text-red-300 font-medium rounded-xs text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Mint
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
      </div>
    </>
  )
}

export default index
