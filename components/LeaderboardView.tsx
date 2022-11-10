import React, { useState, useEffect, useCallback } from 'react'
import { Layout } from '.'
import { Bid } from '../types'
import { gql, useQuery } from '@apollo/client'
import AccountId from './AccountId'
import Link from 'next/link'

const utils = require('ethers').utils

const BIDS_QUERY = gql`
  query Gallery(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
  ) {
    bidLogs(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { accepted: true }
    ) {
      id
      bidder {
        id
      }
      item {
        id
        creator {
          id
        }
        name
        tokenId
      }

      amount
      accepted
      canceled
      timestamp
    }
  }
`
const LeaderboardView: React.VFC = () => {
  const [bids, setBids] = useState<Bid[]>([])

  const { loading, error, data, fetchMore } = useQuery(BIDS_QUERY, {
    variables: {
      first: 48,
      skip: 0,
      orderBy: 'amount',
      orderDirection: 'desc',
    },
  })

  const getBids = async (data) => {
    setBids([...bids, ...data])
  }

  const onLoadMore = useCallback(() => {

    if (fetchMore === undefined) return;

    if (
      Math.round(window.scrollY + window.innerHeight) >=
      Math.round(document.body.scrollHeight)
    ) {
      fetchMore({
        variables: {
          skip: bids.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev
          return fetchMoreResult
        },
      })
    }
  }, [fetchMore, bids.length])

  useEffect(() => {
    data ? getBids(data.bidLogs) : console.log('loading')
  }, [data])

  useEffect(() => {
    window.addEventListener('scroll', onLoadMore)
    return () => {
      window.removeEventListener('scroll', onLoadMore)
    }
  }, [onLoadMore])

  if (error) {
    return (
      <Layout>
        <div className={'md:mt-12 pb-8 max-w-xl mx-auto'}>{error}</div>
      </Layout>
    )
  }

  return (
    <div className={'flex flex-col space-y-4 md:mt-24'}>
      <div
        className={' grid-cols-1 mx-2 sm:mx-auto space-y-2 max-w-xl'}
      >
        {bids.map((bid, key) => (
          <Link href={`/object/${bid.item?.tokenId}`}>
          <div key={key}>
            <div className="px-2 py-4 w-full border-2 border-gray-700">
              <div className="min-w-0 flex justify-between">
                <div>
                  <AccountId address={bid.item.creator.id} link={'owned'} />
                  <p className="mt-2 flex items-center text-sm">
                    {bid.item.name}
                    {/* <span className="truncate">
                      {moment.unix(bid.timestamp).format('MMMM D, YYYY h:mm a')}
                    </span> */}
                  </p>
                </div>
                <div>
                  <div>
                    <p className="md:text-xl font-bold">
                      {utils.formatEther(bid.amount)} MATIC
                    </p>
                    {/* {!!bid.accepted && (
                      <p className="mt-2 flex items-center text-sm ">
                        <CheckCircleIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                          aria-hidden="true"
                        />
                        Bid Accepted
                      </p>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Link>
        ))}
      </div>

      {!!loading && (
        <div className={'pb-8 max-w-xl mx-auto w-fulltext-white'}>
          loading...
        </div>
      )}
    </div>
  )
}

export default LeaderboardView
