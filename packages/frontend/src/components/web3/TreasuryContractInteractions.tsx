import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import { ContractIds } from '@deployments/deployments'
import { BN, formatBalance } from '@polkadot/util'
import {
  contractQuery,
  contractTx,
  unwrapResultOrError,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import 'twin.macro'

export const TreasuryContractInteractions: FC = () => {
  const { api, activeAccount, isConnected, activeSigner } = useInkathon()
  const { contract: treasuryContract, address: treasuryContractAddress } = useRegisteredContract(
    ContractIds.Treasury,
  )
  const [balance, setBalance] = useState<string>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ depositMessage: string }>()
  const CHAIN_DECIMALS = 18

  // Fetch Greeting
  const fetchBalance = async () => {
    if (!treasuryContract || !api || !isConnected || !activeAccount) return

    setFetchIsLoading(true)
    try {
      const result = await contractQuery(
        api,
        activeAccount.address,
        treasuryContract,
        'get_balance',
      )
      const balanceMessage = unwrapResultOrError(result)
      console.log(balanceMessage)
      /*
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        treasuryContract,
        'get_balance',
      )
      console.log(output, isError, decodedOutput)*/
      const theBalanceAsBN = new BN(balanceMessage) //decodedOutput)
      const formattedBalanceMessage = formatBalance(theBalanceAsBN, { decimals: CHAIN_DECIMALS })
      setBalance(formattedBalanceMessage)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching balance.')
      setBalance(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [treasuryContract, activeAccount])

  // Make a Deposit
  const makeDeposit = async () => {
    if (!activeAccount || !treasuryContract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setUpdateIsLoading(true)
    toast.loading('Updating deposit…', { id: `update` })
    // Gather form value
    const depositMessage = form.getValues('depositMessage')
    const depositAsFloat = parseFloat(depositMessage)
    if (isNaN(depositAsFloat)) {
      toast.error('Please specify a number to deposit')
    } else {
      try {
        // Estimate gas & send transaction
        const depositValue: BN = new BN(depositAsFloat).mul(new BN(10).pow(new BN(CHAIN_DECIMALS)))
        await contractTx(
          api,
          activeAccount.address,
          treasuryContract,
          'deposit',
          { value: depositValue }, //needs to be a BN in a ContractOptions object
          [],
        )

        toast.success(`Successfully made a deposit of value ` + depositMessage)
        form.reset()
      } catch (e) {
        console.log(e)
        toast.error('Error while making a deposit. Try again.')
        toast.error('Error ' + e)
      }
    }
    setUpdateIsLoading(false)
    toast.dismiss(`update`)
    fetchBalance() //Balance should be updated after the deposit was made.
  }

  if (!treasuryContract) return null

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[20rem]">
        <h2 tw="text-center font-mono text-gray-400">Treasury Smart Contract</h2>

        {/* Fetched Greeting */}
        {!!isConnected && (
          <Card variant="outline" p={4} bgColor="whiteAlpha.100">
            <FormControl>
              <FormLabel>My balance in Treasury</FormLabel>
              <Input placeholder={fetchIsLoading ? 'Loading…' : balance} disabled={true} />
            </FormControl>
          </Card>
        )}

        {/* Make A Deposit */}
        {!!isConnected && (
          <Card variant="outline" p={4} bgColor="whiteAlpha.100">
            <form>
              <Stack direction="row" spacing={2} align="end">
                <FormControl>
                  <FormLabel>Make a Deposit:</FormLabel>
                  <Input disabled={updateIsLoading} {...form.register('depositMessage')} />
                </FormControl>
                <Button
                  mt={4}
                  colorScheme="purple"
                  isLoading={updateIsLoading}
                  disabled={updateIsLoading}
                  type="button"
                  onClick={makeDeposit}
                >
                  Submit
                </Button>
              </Stack>
            </form>
          </Card>
        )}

        {/* Contract Address */}
        <p tw="text-center font-mono text-xs text-gray-600">{treasuryContractAddress}</p>
      </div>
    </>
  )
}
