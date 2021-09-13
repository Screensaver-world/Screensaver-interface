import React from 'react'
import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useRouter } from 'next/router'
import { useGalleryContract } from '../../hooks/useContract'

export default function index() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { tokenId } = router.query
  const { account, library } = useWeb3React<Web3Provider>()
  const galleryContract = useGalleryContract();

  async function burn(tokenId: string) {
    
    setLoading(true)
    let tx = await galleryContract.burn(tokenId)
    await tx.wait()
    setLoading(false)
    router.push(`/owned/${account}`)

  }

  return (
    <>
      <div className={'mr-2 hidden md:inline'}>
        {!!tokenId && (
          <button
            onClick={() => burn(tokenId.toString())}
            className="px-6 w-full py-2 border border-red-50 hover:bg-gray-800 text-sm font-medium rounded-sm text-red-50 bg-gray-900  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-50"
          >
            Burn
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
    </>
  )
}
