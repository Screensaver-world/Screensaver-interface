import { FaTwitter, FaDiscord } from 'react-icons/fa'
import banner from '../assets/banner.png'

/* This example requires Tailwind CSS v2.0+ */
export default function Header() {
  return (
    <div className="w-full flex flex-col sm:justify-center sm:flex-row sm:py-16 sm:px-10">
      <div className="w-full max-w-4xl mx-auto text-center py-20 px-6 md:px-20 order-2 sm:order-1">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Welcome to Screensaver.world!</span>
          {/* <span className="block">SSW is community first and open source NFT protocol on Polygon.</span> */}
        </h2>
        <p className="mt-4 text-lg leading-6 text-gray-200">
          Artist's need safe spaces to create and share art. NFTs present a novel opportunity to revolutionize digital art and artists. Let's just be cool, be nice to one another, and not fuck things up.
        </p>
        <div className={'inline-flex space-x-4'}>
          <a
            href="https://discord.gg/fAGHysxKux"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-gray-200 text-gray-200 text-base font-medium rounded-md hover:bg-indigo-50 hover:text-indigo-400 sm:w-auto"
          >
            <FaDiscord className="mr-2" /> Discord
          </a>
          <a
            target="_blank"
            href="https://twitter.com/screensavernft"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-gray-200 text-gray-200 text-base font-medium rounded-md hover:bg-indigo-50 hover:text-indigo-400 sm:w-auto"
          >
            <FaTwitter className="mr-2" /> Twitter
          </a>
        </div>
      </div>
      {/* <a href={'https://ssw.auction'} className={'w-full cursor-pointer sm:w-1/2 h-48 min-w-3/4 object-fill sm:h-96 sm:px-5 md:px-10 order-1 sm:order-2 hidden sm:inline-block'} >
      <img  src={banner} alt={'Screen Banner'} className={'w-full h-48 object-fill sm:h-96 hidden sm:inline-block'} />
      </a> */}
    </div>
  )
}
