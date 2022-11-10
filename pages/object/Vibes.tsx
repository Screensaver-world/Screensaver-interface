import React, { useState, useEffect, useRef } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'

import VIBES_WELLSPRING_ABI from '../../constants/abis/vibes'
import { getNetworkLibrary } from '../../connectors'
import vibesLogo from '../../assets/vibes.png';

// VIBES ticker refresh in ms
const REFRESH_VIBES_INTERVAL = 100;

const SICK_VIBES_SITE_URL = 'https://www.sickvibes.xyz';

// VIBES after render
interface VibesAtRender {
  initialClaimableVibes: BigNumber
  initialDateTime: Date
}
// VIBES token interface
interface VibesToken {
  balance: BigNumber
  claimable: BigNumber
  dailyRate: BigNumber
  isLegacyToken: boolean
  isSeeded: boolean
  isValidToken: boolean
  lastClaimAt: BigNumber
  nft: string
  operator: string
  owner: string
  seededAt: BigNumber
  seeder: string
  tokenId: BigNumber
  tokenURI: string
  unlocksAt: BigNumber
}

const formatVibes = (vibes: BigNumber, decimal = 18, toFixed = 3): string => {
  // convert to base 10
  const decimalVibes = vibes.toString();
  
  // Split into two parts
  const indexForDecimalPoint = decimalVibes.length - decimal;
  const wholeNumber = decimalVibes.slice(0, indexForDecimalPoint);
  const fractionalNumber = decimalVibes.slice(indexForDecimalPoint);

  // Format and concatenate
  const formattedWholeNumber = wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedFractionalNumber = fractionalNumber.slice(0, toFixed);
  const formattedVibes = `${formattedWholeNumber}.${formattedFractionalNumber}`;

  // Return dat pretty boi
  return formattedVibes;
};

/**
 * Calculate live claimable VIBES and return in human-readable form
 */
const calculateLiveInfusedVibes = (initialVibes: VibesAtRender, dailyRate: BigNumber) => {
  const now = new Date();
  const { initialClaimableVibes, initialDateTime } = initialVibes;
  const msElapsed = now.getTime() - initialDateTime.getTime();

  // do math
  const vibesToAdd = dailyRate.mul(msElapsed).div(24 * 60 * 60 * 1000);
  const currentClaimableVibes = initialClaimableVibes.add(vibesToAdd);

  // format it real cute
  const formattedVibes = formatVibes(currentClaimableVibes);
  return formattedVibes;
};

const Vibes = ({ tokenId }) => {
  const { account } = useWeb3React<Web3Provider>()
  const [tokenInfo, setTokenInfo] = useState<VibesToken | undefined>();
  const [claimableVibes, setClaimableVibes] = useState<string>('');
  const startDateTime = useRef(new Date());

  const vibesTokenUrl = `${SICK_VIBES_SITE_URL}/tokens/${process.env.NEXT_PUBLIC_CONTRACT_ID}/${tokenId}`;

  const getVibes = async () => {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_VIBES_CONTRACT_ID,
      VIBES_WELLSPRING_ABI,
      getNetworkLibrary(),
    )
    const token = await contract.getToken(process.env.NEXT_PUBLIC_CONTRACT_ID, tokenId);
    if (token && token.isSeeded) {
      setTokenInfo(token);
    } 
  }

  const getClaimableVibes = () => {
    if (tokenInfo) {
      const claimableVibes = calculateLiveInfusedVibes(
        {
          initialClaimableVibes: tokenInfo.claimable,
          initialDateTime: startDateTime.current 
        },
        tokenInfo.dailyRate,
      );
      setClaimableVibes(claimableVibes);
    }
  }

  useEffect(() => {
    getVibes();
  }, [account])

  useEffect(() => {
    if (tokenInfo) {
      const h = setInterval(getClaimableVibes, REFRESH_VIBES_INTERVAL);
      return () => clearInterval(h);
    }
  }, [tokenInfo])

  return claimableVibes.length ? (
    <div className={'flex flex-col space-y-12'}>
      <div className={'flex flex-col space-y-8'}>
          <div className={'px-3 text-red-300 flex flex-row gap-x-1'}>
            <div>
              <a target="_blank" href={vibesTokenUrl}>
                <img
                  width={'25px'}
                  src={vibesLogo.src}
                  alt={'vibes logo'}
                />
              </a>
            </div>
            <div>
              <a target="_blank" href={vibesTokenUrl}>{claimableVibes} VIBES</a>
            </div>
          </div>
      </div>
    </div>
  ) : <div/>
}

export default Vibes
