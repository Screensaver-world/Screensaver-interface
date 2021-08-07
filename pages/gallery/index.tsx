import React from 'react'
import { Layout } from '../../components'
import ExploreView from '../ExploreView'

const GalleryPage: React.VFC = () => {
  
  return (
    <Layout>
      <div className={'pb-8 w-full md:w-11/12 mx-auto'}>
        <ExploreView />
      </div>
    </Layout>
  )
}

export default GalleryPage
