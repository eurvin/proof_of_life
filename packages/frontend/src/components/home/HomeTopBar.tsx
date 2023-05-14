import { FC } from 'react'
import 'twin.macro'
import { ConnectButton } from '@components/web3/ConnectButton'

export const HomeTopBar: FC = () => {
  return (
    <>
      <div tw="flex items-center justify-between bg-purple-500 p-3 text-white">
        {/* Zn Logo */}
        <div tw="font-bold text-3xl">Proof of Life</div>

        {/* Connect Wallet Button */}
        <ConnectButton />
      </div>
    </>
  )
}
