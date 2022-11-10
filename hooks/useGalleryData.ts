import { useState, useEffect } from 'react';
import { db } from '../config/firebase'
import { Gallery } from '../types'

interface IProps {
    account: string
}

function useGalleryData({account}: IProps): [boolean, Gallery | undefined] {

    const [galleryData, setGalleryData] = useState<Gallery | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    // check reports for
    useEffect(() => {
        if (!account) return;
        const unsubscribe = db
          .collection('galleries')
          .doc(account)
          .onSnapshot((doc) => {
            if (!doc.exists) return setLoading(false);

            const galleryData: Gallery = {
                title: '',
                address: '',
                ids: [],
                description: '',
                timestamp: new Date
            };
            
            console.log("DOC", doc.data())
            if (doc.data().title) {
                galleryData.title = doc.data().title
            }
            
            if (doc.data().description) {
                galleryData.description = doc.data().description
            }

            if (doc.data().ids) {
                galleryData.ids = doc.data().ids
            }

            if (doc.data().address) {
                galleryData.address = doc.data().address
            }

            setGalleryData(galleryData);

            setLoading(false);
          })
        return () => unsubscribe() // Make sure we un-register Firebase observers when the component unmounts.
      }, [])

  return [loading, galleryData];
}


export default useGalleryData;