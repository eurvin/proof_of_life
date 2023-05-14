import { AboutUs } from '@components/about/AboutUs'
import { HomePageTitle } from '@components/home/HomePageTitle'
import { HomeTopBar } from '@components/home/HomeTopBar'
import { CenterBody } from '@components/layout/CenterBody'
import { NFTStreamsMockup } from '@components/web3/NFTStreamsMockup'
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
      <HomeTopBar />

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
          <NFTStreamsMockup />
        </div>

        {/* About Us Button */}
        <div tw="fixed bottom-4 right-4">
          <AboutUs tw="rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 focus:(outline-none ring-2 ring-purple-500 ring-offset-2)" />
        </div>
      </CenterBody>
    </>
  )
}

export default HomePage
