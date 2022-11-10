import React, { useEffect } from 'react'
import useAxios from 'axios-hooks'
import Link from 'next/link'
import { shortenAddress } from '../../utils'
import { SSW_API_URL } from '../../constants'

interface Props {
    address: string
    link: string
}

export default function AccountId({address, link}: Props) {
    const [{ data, loading, error }, refetch] = useAxios(
        `${SSW_API_URL}/getProfileFromAddress/?address=${address}`
      )

      if (loading || !data?.username) {
        return (
          <Link href={`https://www.screensaver.world/created/${address}`} className={'hover:bg-gray-800 p-2 -ml-2 rounded-md'}>{!!address && shortenAddress(address)}
          </Link>
        )
      }

      if (error) return <p>Error!</p>
      if (!data) return <p>Error!</p>

      return (
        <div className={'font-bold text-md text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-300'}>
          <Link href={`https://www.screensaver.world/${data?.username}`} className={'hover:bg-gray-800 hover:from-pink-300 hover:to-pink-400 p-2 -ml-2 rounded-md font-bold text-md text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-300'}>@{data.username}
          </Link>
        </div>
      )
}
