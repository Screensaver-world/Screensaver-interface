/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import  Link from 'next/link'
import { shortenAddress, getSigner } from '../utils'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { injected } from '../connectors'
import styles from '../styles/Wallet.module.css'
import useGalleryData from '../hooks/useGalleryData'
import { ethers } from 'ethers'
import { POLYGON_MAINNET_PARAMS } from '../constants/'
import { useMaticBalance } from '../hooks/useMaticBalance'

interface IProps {
  status: string
  open: boolean
  setOpen: (open: boolean) => void
}

const SwitchView = () => {
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
    <div className={'m-4'}>
      <div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title
            as="h3"
            className="text-xl leading-6 font-bold text-gray-900 mb-6"
          >
            Screensaver.world runs on Polygon
          </Dialog.Title>
        </div>
      </div>
      {/* <div className="mt-5 sm:mt-5"> */}
      <button
        type="button"
        onClick={switchToPolygon}
        className="inline-flex items-center px-6 py-3 shadow-sm text-base font-medium rounded-md text-white bg-red-300"
      >
        Switch to Polygon
      </button>

      <p className={'text-gray-700 mt-6'}>
        Screensaver.world runs on Polygon so artists can enjoy low fees and
        guilt free minting.
      </p>
      {/* <a className={"text-gray-700 underline mt-8"}>Learn more.</a> */}
      {/* </div> */}
    </div>
  )
}

interface ConnectIProps {
  setOpen: (open: boolean) => void
}

function AccountBar() {
  const maticBalance = useMaticBalance()

  const { chainId, account } = useWeb3React<Web3Provider>()

  return (
    <>
      <div className="flex border h-12 focus:outline-none space-x-2">

        <div className="w-full py-2 border-red-300 bg-black text-md font-medium rounded-sm text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          {chainId === 137 && !!account && shortenAddress(account)}
        </div>

        {account && (
        <div className="w-full py-2 border-red-300 bg-black text-md font-medium rounded-sm text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
        {maticBalance.toFixed(3)} MATIC
          </div>
        )}
      </div>
    </>
  )
}

const ConnectView: React.VFC<ConnectIProps> = ({ setOpen }) => {
  const {
    chainId,
    account,
    activate,
    active,
    deactivate,
    library,
  } = useWeb3React<Web3Provider>()
  const [galleryDataLoading, gallery] = useGalleryData({account});

  return (
        <div className="mt-3 flex flex-col text-center sm:mt-5 space-y-3">
          {!!account && 
            <Link href={`/created/${account}`} className="inline-flex mb-3 justify-center px-6 py-3 text-xl font-medium rounded-md text-white bg-green-600">
            🎨 My Account ➡️
          </Link>
          }

          {!!account && 
            <Link href={`/editAccount`} className="inline-flex mb-3 justify-center px-6 py-3 text-xl font-medium rounded-md text-white bg-red-600">
            Edit Account ➡️
          </Link>
          }

          {(!!account && !!gallery?.title) && 
            <Link href={`/gallery/${gallery?.title}`} className="inline-flex mb-3 justify-center px-6 py-3 text-xl font-medium rounded-md text-white bg-red-600">
            Your Gallery
          </Link>
          }

{(!!account && !gallery?.title) && 
            <Link href={'/manageGallery'} className="inline-flex mb-3 justify-center px-6 py-3 text-xl font-medium rounded-md text-white bg-red-600">
            Create a Gallery
          </Link>
          }

             <div className="mt-2">
          <p className="text-xl text-black font-bold">Wallet</p>
        </div>
          {!account ? (
            <Dialog.Title
              as="h3"
              className="text-xl leading-6 font-bold text-gray-900"
            >
              Connect Your Wallet
            </Dialog.Title>
          ) : (
            <AccountBar />
          )}

        <button
          type="button"
          onClick={
            !account
              ? () => {
                  activate(injected)
                  setOpen(false)
                }
              : deactivate
          }
          className="flex justify-center px-6 py-3 shadow-sm text-base font-medium rounded-md text-white bg-red-300"
        >
          {!account ? 'Connect with Metamask' : 'Deactivate'}
        </button>

      </div>
  )
}

function ModalViews({ status, setOpen }) {
  return (
    <div>
      {(() => {
        switch (status) {
          case 'connect':
            return <ConnectView setOpen={setOpen} />
          case 'switch-network':
            return <SwitchView />
          // case 'error':
          //     return <ConnectView />;
          default:
            return null
        }
      })()}
    </div>
  )
}

const Modal: React.VFC<IProps> = ({ status, open, setOpen }) => {
  const { account, chainId } = useWeb3React<Web3Provider>()

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
            <div className="inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-center overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              {chainId !== 137 && (
                <ModalViews status={'switch-network'} setOpen={setOpen} />
              )}
              {chainId === 137 && !account && (
                <ModalViews status={'connect'} setOpen={setOpen} />
              )}
              {chainId === 137 && !!account && (
                <ModalViews status={status} setOpen={setOpen} />
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Modal
