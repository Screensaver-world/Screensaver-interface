import { Fragment, useState, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { db } from '../../config/firebase'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

interface IProps {
  status: string
  open: boolean
  setOpen: (open: boolean) => void
}

const ReportModal: React.VFC<IProps> = ({ open, setOpen }) => {
  
  const router = useRouter()
  const { tokenId } = router.query
  const [report, setReport] = useState('')
  const [success, setSuccess] = useState(false)
  const { account } = useWeb3React<Web3Provider>()

  function reportContent(tokenId) {
    db.collection('reported')
      .doc(tokenId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          // ALREADY REPORTED
          let tickets = []
          if (doc.data().tickets) {
            tickets = doc.data().tickets
          }
          tickets.push({report, created: new Date(), account})
          db.collection('reported')
            .doc(tokenId)
            .update({ tickets })
            .then(() => {
              setSuccess(true)
            })
        } else {
          // NOT YET REPORTED
          const tickets = [{report, created: new Date(), account}]
          db.collection('reported')
            .doc(tokenId)
            .set({ tickets, status: 'pending' })
            .then(() => {
              setSuccess(true)
            })
        }
      })
  }

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
              <div className={'m-4'}>
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-xl leading-2 font-bold text-gray-900 mb-6"
                    >
                      {`Report Token ${tokenId}`}
                    </Dialog.Title>
                  </div>
                </div>
                <div>

                {!success ? (
                  <div>
                    <textarea
                      id="about"
                      name="about"
                      rows={3}
                      placeholder={
                        "Please provide details on why you are concerned about this particular item on Screensaver. If you're flagging a copyright violation, include the original item's URL or the creator's website."
                      }
                      className="max-w-lg h-48 shadow-sm block w-full text-black focus:ring-red-500 focus:border-red-500 sm:text-sm border-gray-700 "
                      defaultValue={''}
                      value={report}
                      onChange={(e) => setReport(e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => reportContent(tokenId)}
                      className="inline-flex justify-center items-center px-6 py-3 mt-6 w-full shadow-sm text-base font-medium rounded-md text-white bg-red-300"
                    >
                      Report
                    </button>
                  </div>
                ) : (
                  <div>
                  <label
                    className={'text-black'}
                  >{`Token ${tokenId} has been successfully reported. We will review it and resolve ASAP. Thanks for helping to keep Screensaver a fun and safe place!`}</label>
                   <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex justify-center items-center px-6 py-3 mt-6 w-full shadow-sm text-base font-medium rounded-md text-white bg-red-300"
                    >
                      Close
                    </button>
                </div>
                )}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default ReportModal
