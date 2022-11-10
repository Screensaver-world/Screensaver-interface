import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import { Gallery } from '../types'
import Link from 'next/link'
import Layout from './Layout'

const GalleriesView: React.VFC = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  async function getGalleries() {
    const galleryRef = db.collection('galleries')
    const snapshot = await galleryRef.get()
    if (snapshot.empty) {
      console.log('No matching documents.')
      return
    }

    let tempGalleries = []
    snapshot.forEach((doc) => {
      console.log('DATA', doc.data())
      const gallery: Gallery = {
        title: doc.data()?.title,
        ids: [],
      }

      if (!doc.data()?.hidden) {
        tempGalleries.push(gallery)
      }

    })

    setGalleries(tempGalleries)

    setLoading(false)
  }

  // check reports for
  useEffect(() => {
    setGalleries([])
    getGalleries()
  }, [])

  if (!galleries) {
    return <div>loading...</div>
  }

  return (
    <Layout>
      <Link href={'/manageGallery'}className={'font-bold text-xl'}>Galleries
      </Link>

      <div className={'flex flex-col space-y-2 mt-8'}>
        {galleries.map((gallery) => (
          <Link href={`/gallery/${gallery.title}`} className={'underline font-light'}>{gallery.title}
          </Link>
        ))}
      </div>
    </Layout>
  )
}

export default GalleriesView
