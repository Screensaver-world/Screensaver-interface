import React from 'react'
import { Layout } from '../components'
import ExploreView from '../components/ExploreView'
import Banner from '../components/Banner'
import Header from '../components/Header'

const Index: React.VFC = () => {
  
  return (
    <Layout>
      <Banner/>
      <Header/>
      <div className={'pb-8 w-full md:w-11/12 mx-auto'}>
        <ExploreView />
      </div>
    </Layout>
  )
}

export default Index