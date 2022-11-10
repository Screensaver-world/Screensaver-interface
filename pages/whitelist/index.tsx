import { Layout } from '../../components'
import React, { useState, useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import { GALLERY_ABI } from '../../constants/gallery'
import { getNetworkLibrary } from '../../connectors'
import { shortenAddress } from "../../utils";

export default function Home() {
  const { account, library } = useWeb3React<Web3Provider>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [whitelistingLoading, setWhitelistingLoading] = useState(false)
  const url = 'https://us-central1-broccoli-df8cd.cloudfunctions.net/api'
  const [isWhitelisted, setIsWhitelisted] = useState(true)

  // ownerOf
  async function checkIsWhitelisted() {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ID,
      GALLERY_ABI,
      getNetworkLibrary(),
    )
    const whitelistStatus = await contract.isWhitelisted(account)

    console.log('whitelistStatus', whitelistStatus)

    setIsWhitelisted(whitelistStatus)
    setLoading(false)
  }

  useEffect(() => {
    if (!account) return
    checkIsWhitelisted()
  }, [account])

  const fetchSeed = async () => {
    try {
      setWhitelistingLoading(true)
      const response = await fetch(`${url}/seed`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          account,
        }),
      })

      const data = await response.json()

      console.log('DATA', data)

      const signature = await library.getSigner().signMessage(data.seed)

      console.log('SEED IS', signature)

      const verificationResponse = await verify(signature)

      setTimeout(() => {
        checkIsWhitelisted()
        setWhitelistingLoading(false)
      }, 30000)

    } catch (err) {
      console.log('ERROR GETTING SEED', err)
    }
  }

  const verify = async (signature) => {
    setWhitelistingLoading(true)
    return fetch(`${url}/verify`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        signature,
        account,
      }),
    })
      .then((res) => {
        console.log('VERIFICATION RESPONSE', res.status)
      })
      .catch((err) => console.log('ERROR GETTING VERIFICATION', err))
  }

  if (!account) {
    return (
      <Layout>
        <div className={'flex w-full justify-center text-2xl font-bold mt-40'}>
          Connect with Metamask to view Whitelist status
        </div>{' '}
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className={'m-20'}>Loading...</div>{' '}
      </Layout>
    )
  }

  return (
    <Layout>
      {isWhitelisted ? (
        <div className={'flex w-full justify-center text-2xl font-bold mt-40'}>
          {`Account ${!!account && shortenAddress(account)} is whitelisted`}
        </div>
      ) : (
        <div className={'w-11/12 max-w-2xl mx-auto py-6'}>
          <h1 className={'text-2xl font-bold mb-3'}>Screensaver Terms of Service</h1>
          <div className={"flex flex-col space-y-2"}>

<p className={""}><b>Terms of Service</b></p>

<p className={""}>Effective, June 4, 2021</p>
<p>Introduction</p>

<p className={""}>Welcome to Screensaver.World, a website owned and operated 
{/* <div
className={"bg-red"}>by XXXXXX, LLC. d/b/a Screensaver.World</div> */}
(“Screensaver”, “Screensaver.World”, “Screensaver.world”, “SW”, “we”, “us”,
“our”). Screensaver is a community-first digital marketplace built on Polygon
Layer 2. Using Polygon technology allows for extremely low minting and bidding
fees when compared to Ethereum (layer 1). Polygon also uses POS which means it's
a cleaner alternative to minting on the Ethereum Mainnet. Screensaver.world is
an entirely open marketplace, with community-led initiatives to further
creators in their pursuit of self-expression. Our platform was built as a
solution for the myriads of amazing creators who could not mint NFTs (See <b>Cryptographic
Assets</b> and <b>Non-Fungible Tokens</b> below)</p>

<p className={""}>These Terms of Use (these “Terms”) govern the end-user
(“you”, “user”, “seller”, “buyer”, or “collector”) Our website gives you, the
end user, the ability to sell, exchange, and purchase cryptographic assets (See
<b>Crypto Assets </b>below), with tradability and resale across other Polygon-compatible
marketplaces. This is the primary service offering available to the user
(collectively named, the “Service”).</p>

<p className={""}>The user can sell and purchase of crypto assets (See <b>Cryptographic
Assets</b>) through an auction (“Auction”). Much like other networks, you can
only participate in this transactional process when connected through a digital
wallet on Polygon-compatible bridge extension like MetaMask (<a
href="https://metamask.io">https://metamask.io</a>). </p>

<p className={""}>Your electronic wallet is used to facilitate a lot of the
services such as submitting a bid, minting, accepting a bid, or canceling one.
You wallet is also the unique address connected with your authorized Twitter
account for verification and account name. When using any wallet, it is
important to read the terms and privacy agreement for your wallet of choice as
their policies are <b>uniquely their own</b>. </p>

<p className={""}>“Cryptographic Assets” or “Crypto Asset” refer to assets
that leverage cryptography, consensus algorithms, distributed ledgers,
peer-to-peer technology and/or smart contracts to function as a store of value,
medium of exchange, unit of account, or decentralized application (DApp). There
are four most common types of cryptoassets: cryptocurrencies, utility tokens,
security tokens and stablecoins.</p>

<p className={""}><b>Our marketplace is a platform for buyers and sellers to
participate in the exchange of crypto assets. Screensaver.World is NOT a
broker, financial institution, or creditor. We are not responsible for any
additional agreements made between buyers and sellers or any users. </b></p>

<p className={""}><b>Our verification through Twitter (</b><a
href="https://twitter.com"><b>https://twitter.com</b></a><b>) is only used as a
means to have a simpler identification compared to the unique wallet address
notated upon use as a buyer or collector. However, it is not a claim of
authenticity or original intellectual property. You, the user, bear the full
responsibility for verifying the identity, authenticity, and legitimacy of the
assets purchased on Screensaver. </b></p>

<p className={""}><b>Screensaver is also a community-driven platform with
small development teams. The product is continually improved as necessary but
will still contain bugs. We keep a running changelog noting the most recent
changes to the marketplace and current, persistent bugs. Please be sure to stay
up to date here: </b><a
href="https://screensaver.gitbook.io/screensaver-world/changelog"><b>https://screensaver.gitbook.io/screensaver-world/changelog</b></a></p>

<p className={""}><b>By clicking the “I ACCEPT” button, connecting your wallet
to Screensaver.World, and using our services for the exchange of crypto assets,
you agree to be bound by these terms and all of the terms incorporated herein
by reference. If you DO NOT agree to these Terms, you may not access or use our
services to purchase and/or sell crypto assets.</b></p>

<p className={""}><b>Screensaver.World reserves t he right to edit or modify
these Terms at any time at our sole discretion. If we make changes to these
terms, we will provide notice of such changes on the website and/or modifying
the “Last Updated” date as shown in the beginning of these Terms. By continuing
use of Screensaver.World to leverage cryptographic assets, you agree to the
current and/or revised Terms. We highly recommend that you check our Terms
often for your own understanding. If you do not agree to the revised Terms,
then you may not access our Service.</b></p>

<p className={""}><b>USER CONDUCT</b></p>

<p className={""}>Although DApps are decentralized, it does not mean it is nor
will ever circumvent the law. You agree that you will not violate any law,
contract, intellectual property or other third party right, and you are <b>solely
responsible </b>for your conduct, while accessing or using our Service. You
agree that you will abide these Terms and will not:</p>

<p ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Provide false or misleading information to Screensaver.World</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use or attempt to use another user’s Account without
authorization from such user and Screensaver.World;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Create or list counterfeit items;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Pose as another person or create a misleading username;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use the Service in any manner that could interfere with, disrupt,
negatively affect or inhibit other users from fully enjoying the Service, or
that could damage, disable, overburden or impair the functioning of the Service
in any manner;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Develop, utilize, or disseminate any software, or interact with
any API in any manner, that could damage, harm, or impair the Service;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Reverse engineer any aspect of the Service, or do anything that
might discover source code or bypass or circumvent measures employed to prevent
or limit access to any Service, area or code of the Service;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Attempt to circumvent any content-filtering techniques we employ,
or attempt to access any feature or area of the Service that you are not
authorized to access;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use any robot, spider, crawler, scraper, script, browser
extension, offline reader or other automated means or interface not authorized
by us to access the Service, extract data or otherwise interfere with or modify
the rendering of Service pages or functionality;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use data collected from our Service to contact individuals,
companies, or other persons or entities;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use data collected from our Service for any direct marketing
activity (including without limitation, email marketing, SMS marketing,
telemarketing, and direct marketing);</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Bypass or ignore instructions that control all automated access
to the Service;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use the Service for any illegal or unauthorized purpose, or
engage in, encourage or promote any activity that violates these Terms;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use the Polygon chain or Ethereum platform to carry out any
illegal activities, including but not limited to money laundering, terrorist
financing or deliberately engaging in activities designed to adversely affect
the performance of the Ethereum Platform, or the Service;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Engage in wash trading or other deceptive or manipulative trading
activities;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Place misleading bids or offers;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Spam listings for the purpose of causing a listing to appear at
the top of the search results;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use the Service to carry out any financial activities subject to
registration or licensing, including but not limited to creating, listing, or
buying securities, commodities, options, real estate, or debt instruments;</p>

<p className={""} ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use the Service from a country sanctioned by the government of
the United States; or</p>

<p  ><span
>·<span >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span>Use the Service to participate in fundraising for a business,
protocol, or platform, including but not limited to creating, listing, or
buying assets that are redeemable for financial instruments, assets that give
owners rights to participate in an ICO or any securities offering, or assets
that entitle owners to financial rewards, including but not limited to, DeFi
yield bonuses, staking bonuses, and burn discounts.</p>

<p className={""}>Our community prides itself on respect. We care about the
health, wellness, and safety of all members on Screensaver.World. If we expect
that a users’ actions threaten the health, wellness, and/or safety of our
members, we will take action. For more information about our statutes and
values, please visit <a
href="https://screensaver.gitbook.io/screensaver-world/statement-of-inclusion">https://screensaver.gitbook.io/screensaver-world/statement-of-inclusion</a>.
You agree to give Screensaver.World full discretion when administrating
reported and unreported crypto assets that are deemed inappropriate,
disruptive, or illegal.</p>

<p className={""}>All users must be 18 years old or older. If you are under
18, you may user Screensaver.World’s service with a parent or guardian’s wallet
extension, but only with their involvement. For any issues regarding the
violation of our Service, the wallet holder will be held responsible everything
done through said connected wallet.</p>

<p className={""}><b>Do not create or list illegal or offensive content, such
as products that depict graphic sexual acts and images that depict children
under the age of 18 in a sexually suggestive manner.</b></p>

<p className={""}>We allow NSFW content. However, you agree to incur the risk
of having your work unpinned from Screensaver.World’s data hosting, and
possible ban (temporary or permanent pending the level of infraction) from
using the platform in the future.  </p>

<p className={""}>If you believe your work has been wrongfully reported or
censor, please join our <a href="https://discord.gg/SDGNky7Qba">Discord channel</a>
and track over to “#please-help”. (While we use Discord to build, manage, and
grow the user community, our views are not reflective of, nor connected to the
policies and views of Discord.com. For more information on their terms: <a
href="https://discord.com/terms">https://discord.com/terms</a>)</p>

<p className={""}>Terms to be refreshed frequently with new legal information
and advisement. Please check daily over the next month.</p>

</div>
          <button
            onClick={fetchSeed}
            className="mt-4 w-full justify-center inline-flex items-center px-6 py-3 border border-red-300 shadow-sm text-red-300 font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={!account}
          >
            {!account ? 'Connect Wallet' : 'I Accept'}
            {whitelistingLoading && (
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
      )}
    </Layout>
  )
}
