import { Layout } from '../../components'
import React, { useState, useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import useGalleryData from '../../hooks/useGalleryData'
import { db } from '../../config/firebase'
import { Gallery } from '../../types'
import { SSW_API_URL } from '../../constants'
import { Switch } from '@headlessui/react'
import classNames from 'classnames'

export default function Home() {
  const { account, library } = useWeb3React<Web3Provider>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingTitleCheck, setLoadingTitleCheck] = useState(false)
  const [hide, setHide] = useState(false)
  const [galleryLoading, storedGallery] = useGalleryData({ account })
  const [error, setError] = useState<null | string>(null)
  const [ids, setIds] = useState<string>('')
  const [userGallery, setUserGallery] = useState<Gallery | undefined>()
  const errorMessages = {
    username: 'Title already in use.',
    blankTitle: 'Title cannot be blank.',
  }

  useEffect(() => {
    if (!storedGallery) return
    console.log('HERE IT IS', storedGallery)
    setUserGallery({
      title: storedGallery.title,
      description: storedGallery.description,
      ids: storedGallery.ids,
    })

    if (storedGallery.hidden) {
      setHide(true)
    }

  }, [storedGallery])

  useEffect(() => {
    const idsString = ids.replace(/\s/g, '')
    const parsedIdsString = idsString.split(',')
    const filteredIds = parsedIdsString.filter((id) => !isNaN(parseInt(id)))
    const parsedIds = filteredIds.map((id) => parseInt(id))
    setUserGallery({ ...userGallery, ids: parsedIds })
  }, [ids])

  useEffect(() => {
    setError(null)

    console.log('TITLE', loadingTitleCheck)
    if (error === errorMessages.blankTitle) {
      setError(null)
    }

    if (!userGallery?.title || userGallery?.title === '') return

    const safeTitle = userGallery?.title.replace(/[^a-zA-Z ]/g, '')
    setUserGallery({ ...userGallery, title: safeTitle.toLowerCase() })

    setLoadingTitleCheck(true)

    async function checkTitle(username: string) {
      // Create a reference to the cities collection
      const galleriesRef = db.collection('galleries')

      // Create a query against the collection
      const titleMatches = await galleriesRef
        .where('title', '==', userGallery?.title)
        .get()

      setLoadingTitleCheck(false)

      console.log('MATCHES EXIST: ', titleMatches.docs.length > 0)

      const matchesCurrentTitle = titleMatches.docs.filter(
        (match) => match?.id === account,
      )

      if (matchesCurrentTitle.length > 0) return setError(null)

      setError(titleMatches.docs.length > 0 ? errorMessages.username : null)
    }

    checkTitle(userGallery?.title)
  }, [userGallery?.title, account])

  const submit = () => {
    console.log('HERE')
    if (!userGallery?.title || userGallery?.title === '')
      return setError(errorMessages.blankTitle)
    signMessage()
  }

  const signMessage = async () => {
    try {
      setLoading(true)

      const originalMessage = userGallery
      originalMessage.timestamp = new Date()
      originalMessage.hidden = hide

      const signedMessage = await library
        .getSigner()
        .signMessage(JSON.stringify(originalMessage))

      await fetch(`${SSW_API_URL}/gallery`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          signedMessage,
          originalMessage,
          account,
        }),
      })

      setLoading(false)
      if (hide) {
        router.push('/galleries')
      } else {
        router.push(`/gallery/${userGallery?.title}`)
      }

    } catch (err) {
      console.log('ERROR GETTING SEED', err)
      setLoading(false)
    }
  }

  if (!account) {
    return (
      <Layout>
        <div className={'flex w-full justify-center text-2xl font-bold mt-40'}>
          Connect with Metamask to manage your gallery
        </div>{' '}
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={'w-11/12 max-w-2xl mx-auto py-6'}>
        <form className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div>
              <div>
                <h3 className="mt-10 max-w-3xl text-3xl text-white font-bold">
                  Manage Gallery
                </h3>
              </div>

              <label className="block text-xs font-bold text-white sm:mt-px sm:pt-2 mb-4">
                Hide Gallery
              </label>
              <Switch
                checked={hide}
                onChange={setHide}
                className={classNames(
                  !hide ? 'bg-gray-200' : 'bg-indigo-600',
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                )}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    !hide ? 'translate-x-0' : 'translate-x-5',
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                  )}
                />
              </Switch>

              <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                  >
                    Title
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex shadow-sm">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={userGallery ? userGallery?.title : ''}
                        onChange={(e) =>
                          setUserGallery({
                            ...userGallery,
                            title: e.target.value,
                          })
                        }
                        className="flex-1 block w-full focus:ring-red-500 focus:border-red-500 min-w-0 sm:text-sm border-gray-700 bg-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                  >
                    Description
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <textarea
                      id="about"
                      name="about"
                      rows={3}
                      className="max-w-lg shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border-gray-700  bg-gray-900"
                      defaultValue={''}
                      value={userGallery ? userGallery?.description : ''}
                      onChange={(e) =>
                        setUserGallery({
                          ...userGallery,
                          description: e.target.value,
                        })
                      }
                    />
                    <p className="mt-2 text-sm text-gray-300">
                      Links, bio, whatever you want...
                    </p>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                  >
                    Token Ids
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <textarea
                      id="about"
                      name="about"
                      rows={3}
                      className="max-w-lg shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border-gray-700  bg-gray-900"
                      defaultValue={''}
                      value={ids}
                      onChange={(e) => setIds(e.target.value)}
                    />
                    <p className="mt-2 text-sm text-gray-300">
                      Enter token ids you want to feature separated by commas -
                      i.e. 1, 2, 3, 4
                    </p>
                  </div>
                </div>
              </div>

              <div className={'text-red-50 text-md font-regular mt-3'}>
                {error && error}
              </div>
            </div>
          </div>
        </form>

        <button
          onClick={submit}
          className="mt-4 w-full justify-center inline-flex items-center px-6 py-3 border border-red-300 shadow-sm text-red-300 font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          disabled={!account || loadingTitleCheck || error !== null}
        >
          Save
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
      </div>
    </Layout>
  )
}
