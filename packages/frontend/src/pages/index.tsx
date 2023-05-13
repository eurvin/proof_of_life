import { HomePageTitle } from '@components/home/HomePageTitle'
import { CenterBody } from '@components/layout/CenterBody'
import { ConnectButton } from '@components/web3/ConnectButton'
import { TreasuryContractInteractions } from '@components/web3/TreasuryContractInteractions'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'

const HomePage: NextPage = () => {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      {/* Top Bar */}
      <div tw="flex items-center justify-between bg-purple-500 p-3 text-white">
        {/* Zn Logo */}
        <div tw="font-bold text-2xl">Zn</div>
        <div tw="font-bold text-3xl">Proof of Life</div>

        {/* Connect Wallet Button */}
        <ConnectButton />
      </div>

      <CenterBody tw="mt-20 mb-10 px-5">
        {/* Title */}
        <HomePageTitle />

        <div tw="mb-5 text-center font-medium text-gray-500 text-lg">
          With Proof of Life, you as parent or guardian can get regular indications that all&apos;s
          well with your dependent.
          <br /> Receive notifications whenever they accept a pre-scheduled transfer from you
          <div tw="mb-0 text-center font-medium text-gray-200 text-lg">
            \/ Start Now - set up your treasury and transfer schedule here! \/
          </div>
        </div>

        <div tw="flex w-full flex-wrap items-start justify-center gap-4">
          {/* Chain Metadata Information */}
          {/* <ChainInfo />*/}
          {/* Treasury Contract Interactions */}
          <TreasuryContractInteractions />
        </div>

        {/* Statement */}
        <div tw="mb-10 text-center font-medium text-purple-500 text-lg">
          Zn is a revolutionary platform for creating and trading NFTs, empowering artists and
          collectors to express themselves in ways never before possible.
        </div>

        {/* About Us Button */}
        <div tw="fixed bottom-4 right-4">
          <button tw="rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 focus:(outline-none ring-2 ring-purple-500 ring-offset-2)">
            About Us
          </button>
        </div>
      </CenterBody>
    </>
  )
}

export default HomePage
