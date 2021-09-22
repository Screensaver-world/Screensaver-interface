import React, { useEffect, useState } from 'react'
import { Layout, Navbar } from '../../components'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AccountView from '../AccountView'

const CollectionPage: React.VFC = () => {
  const router = useRouter()
  const { account } = router.query
  
  return (
    <Layout>
      <Head>
        <title>Screensaver.world | Created by {account.toString()}</title>
      </Head>
      <div className={'md:mt-12 pb-8 w-11/12 mx-auto'}>
        <AccountView state={'forSale'} account={account.toString()}/>
      </div>
    </Layout>
  )
}

export default CollectionPage
