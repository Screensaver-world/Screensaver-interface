import React from 'react'
import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { useWeb3React } from '@web3-react/core'
import { shortenAddress } from '../../utils'
import { Web3Provider } from '@ethersproject/providers'
import { useMaticBalance } from '../../hooks/useMaticBalance'
import { POLYGON_MAINNET_PARAMS } from '../../constants'
import { injected } from '../../connectors'
import makeBlockie from 'ethereum-blockies-base64'

export default function index() {
  const [open, setOpen] = useState(false)
  const maticBalance = useMaticBalance()

  const { chainId, account } = useWeb3React<Web3Provider>()

  async function switchToPolygon() {
    injected.getProvider().then((provider) => {
      provider
        .request({
          method: 'wallet_addEthereumChain',
          params: [POLYGON_MAINNET_PARAMS],
        })
        .catch((error: any) => {
          console.log(error)
        })
    })
  }
  
  return (
    <>
      <Modal status={'connect'} open={open} setOpen={setOpen} />

      {chainId !== 137 && (
        <div
          className={
            'md:relative fixed flex w-full md:w-auto justify-center p-6 md:p-0 bottom-0 left-0 border-t md:border-t-0 border-red-100 bg-black md:bg-transparent'
          }
        >
          <button
            onClick={() => switchToPolygon()}
            className="px-6 py-2 border border-red-300 text-sm font-medium rounded-full text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Switch to Polygon{' '}
          </button>
        </div>
      )}

      {chainId === 137 && !account && (
        <div
          className={
            'md:relative fixed flex w-full md:w-auto justify-center p-6 md:p-0 bottom-0 left-0 border-t md:border-t-0 border-red-100 bg-black md:bg-transparent'
          }
        >
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-2 border border-red-300 text-sm font-medium rounded-full text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Connect
          </button>
        </div>
      )}

      {chainId === 137 && !!account && (
        <button
          onClick={() => setOpen(true)}
          className={
            'h-8 w-8 rounded-full focus:outline-none hover:shadow-white'
          }
        >
          <img style={{ borderRadius: '50%' }} src={makeBlockie(account)} />
        </button>
      )}
    </>
  )
}
