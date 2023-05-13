import Link from 'next/link'
import { FC } from 'react'
import 'twin.macro'
import tw, { styled } from 'twin.macro'

const StyledIconLink = styled(Link)(() => [
  tw`opacity-90 transition-all hover:(-translate-y-0.5 opacity-100)`,
])

export const HomePageTitle: FC = () => {
  const title = 'ink!athon'
  const desc = 'Full-Stack DApp Boilerplate for Substrate and ink! Smart Contracts'
  const githubHref = 'https://github.com/scio-labs/inkathon'
  const deployHref = 'https://github.com/scio-labs/inkathon#deployment'
  const sponsorHref = 'mailto:hello@scio.xyz'
  const telegramHref = 'https://t.me/inkathon'

  return (
    <>
      <div tw="mb-5 text-center font-bold text-gray-200 text-3xl">
        Welcome to the Proof of Life dApp!
      </div>
    </>
  )
}
