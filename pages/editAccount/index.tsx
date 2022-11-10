import { Layout } from '../../components'
import React, { useState, useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import useAccountData from '../../hooks/useAccountData'
import { db } from '../../config/firebase'
import { Profile } from '../../types'
import { SSW_API_URL } from '../../constants'

export default function Home() {
  const { account, library } = useWeb3React<Web3Provider>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingUsernameCheck, setLoadingUsernameCheck] = useState(false)
  const [profileLoading, storedProfile] = useAccountData({ account })
  const [error, setError] = useState<null | string>(null)
  const [userProfile, setUserProfile] = useState<Profile | undefined>()
  const errorMessages = {
    username: 'Username already in use.',
    blankUsername: 'Username cannot be blank.',
  }

  useEffect(() => {
    if (!storedProfile) return
    setUserProfile({
      username: storedProfile.username,
      description: storedProfile.description,
    })
  }, [storedProfile])

  useEffect(() => {
    setError(null)

    if (error === errorMessages.blankUsername) {
      setError(null)
    }

    if (!userProfile?.username || userProfile?.username === '') return

    const safeUsername = userProfile?.username.replace(/[^A-Z0-9]+/ig, "_");

    setUserProfile({...userProfile, username: safeUsername.toLowerCase()})

    setLoadingUsernameCheck(true)

    async function checkUsername(username: string) {
      // Create a reference to the cities collection
      const profilesRef = db.collection('profiles')

      // Create a query against the collection
      const usernameMatches = await profilesRef
        .where('username', '==', userProfile?.username)
        .get()

      setLoadingUsernameCheck(false)

      console.log('MATCHES EXIST: ', usernameMatches.docs.length > 0)

      const matchesCurrentUsername = usernameMatches.docs.filter(
        (match) => match?.id === account,
      )

      if (matchesCurrentUsername.length > 0) return setError(null)

      setError(usernameMatches.docs.length > 0 ? errorMessages.username : null)
    }

    checkUsername(userProfile?.username)
  }, [userProfile?.username, account])

  const submit = () => {
    if (!userProfile?.username || userProfile?.username === '')
      return setError(errorMessages.blankUsername)
    signMessage()
  }

  const signMessage = async () => {
    try {
      setLoading(true)

      const originalMessage = userProfile

      originalMessage.timestamp = new Date()

      const signedMessage = await library.getSigner().signMessage(JSON.stringify(originalMessage))

      await fetch(`${SSW_API_URL}/profile`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          signedMessage,
          originalMessage,
          account
        }),
      })

      setLoading(false)
      router.push(`/created/${account}`)
    } catch (err) {
      console.log('ERROR GETTING SEED', err)
      setLoading(false)
    }
  }

  if (!account) {
    return (
      <Layout>
        <div className={'flex w-full justify-center text-2xl font-bold mt-40'}>
          Connect with Metamask to edit your account
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
                  Edit Account
                </h3>
              </div>

              <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-700 sm:pt-5">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-white sm:mt-px sm:pt-2"
                  >
                    Username
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex shadow-sm">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={userProfile ? userProfile?.username : ''}
                        onChange={(e) => setUserProfile({...userProfile, username: e.target.value.toLowerCase()})}
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
                      value={userProfile ? userProfile?.description : ''}
                      onChange={(e) => setUserProfile({...userProfile, description: e.target.value})}
                    />
                    <p className="mt-2 text-sm text-gray-300">
                      Links, bio, whatever you want...
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
          disabled={!account || loadingUsernameCheck || error !== null}
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
