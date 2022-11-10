import { useState, useEffect } from 'react';
import { db } from '../config/firebase'
import { Profile } from '../types'
interface IProps {
    account: string
}

function useAccountData({account}: IProps): [boolean, Profile | undefined] {

    const [accountData, setAccountData] = useState<Profile | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    // check reports for
    useEffect(() => {
        if (!account) return;
        const unsubscribe = db
          .collection('profiles')
          .doc(account)
          .onSnapshot((doc) => {
            if (!doc.exists) return setLoading(false);

            const accountData: Profile = {
                username: '',
                profileImage: '',
                bannerImage: '',
                description: '',
                timestamp: new Date
            };
            
            console.log("DOC", doc.data())
            if (doc.data().username) {
                accountData.username = doc.data().username
            }
            
            if (doc.data().description) {
                accountData.description = doc.data().description
            }

            setAccountData(accountData);

            setLoading(false);
          })
        return () => unsubscribe() // Make sure we un-register Firebase observers when the component unmounts.
      }, [])

  return [loading, accountData];
}


export default useAccountData;