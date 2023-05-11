import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import { ContractIds } from '@deployments/deployments'
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

  // Fetch Greeting
  const fetchBalance = async () => {
    if (!treasuryContract || !api) return

    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', treasuryContract, 'get_balance')
      const balanceMessage = unwrapResultOrError<string>(result)
      /*TODO:set the decimals to the right number for the node when the deposit is 
      // formatted the same way too. This code is commented out here. Until then,
      // just show it as is.
      const formattedBalanceMessage = formatBalance(balanceMessage, { decimals: 18 })
      */
      const formattedBalanceMessage = balanceMessage
      setBalance(formattedBalanceMessage)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching greeting. Try again…')
      setBalance(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }
  useEffect(() => {
    fetchBalance()
  }, [treasuryContract])

  // Make a Deposit
  const makeDeposit = async () => {
    if (!activeAccount || !treasuryContract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setUpdateIsLoading(true)
    toast.loading('Updating deposit…', { id: `update` })
    try {
      // Gather form value
      const depositMessage = form.getValues('depositMessage')

      /*TODO format depositMessage with the correct number of decimals. Until then,
      //use it directly as is */
      // Estimate gas & send transaction
      //const depositValue: BN = new BN(depositMessage).mul(new BN(10).pow(new BN(12)))
      const depositValue = depositMessage
      //const payableOption: ContractOptions = { value: depositValue }
      await contractTx(
        api,
        activeAccount.address,
        treasuryContract,
        'deposit',
        { value: depositValue }, //needs to be a BN in a ContractOptions object
        [],
      )
      toast.success(`Successfully made a deposit`)
      form.reset()
    } catch (e) {
      console.log(e)
      toast.error('Error while making a deposit. Try again.')
      toast.error('Error ' + e)
    } finally {
      setUpdateIsLoading(false)
      toast.dismiss(`update`)
      fetchBalance() //Balance should be updated after the deposit was made.
    }
  }

  if (!treasuryContract) return null

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[20rem]">
        <h2 tw="text-center font-mono text-gray-400">Treasury Smart Contract</h2>

        {/* Fetched Greeting */}
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
          <FormControl>
            <FormLabel>Treasury balance</FormLabel>
            <Input placeholder={fetchIsLoading ? 'Loading…' : balance} disabled={true} />
          </FormControl>
        </Card>

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
