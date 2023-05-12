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

export const GreeterContractInteractions: FC = () => {
  const { api, activeAccount, isConnected, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Greeter)
  const [greeterMessage, setGreeterMessage] = useState<string>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const [cashOutIsLoading, setCashOutIsLoading] = useState<boolean>()
  const form = useForm<{ newMessage: string }>()

  // Fetch Greeting
  const fetchGreeting = async () => {
    if (!contract || !api) return

    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'greet')
      const message = unwrapResultOrError<string>(result)
      setGreeterMessage(message)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching greeting. Try again…')
      setGreeterMessage(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }
  useEffect(() => {
    fetchGreeting()
  }, [contract])

  // Update Greeting
  const updateGreeting = async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setUpdateIsLoading(true)
    toast.loading('Updating greeting…', { id: `update` })
    try {
      // Gather form value
      const newMessage = form.getValues('newMessage')

      // Estimate gas & send transaction
      await contractTx(api, activeAccount.address, contract, 'setMessage', {}, [newMessage])
      toast.success(`Successfully updated greeting`)
      form.reset()
    } catch (e) {
      console.error(e)
      toast.error('Error while updating greeting. Try again.')
    } finally {
      setUpdateIsLoading(false)
      toast.dismiss(`update`)
      fetchGreeting()
    }
  }

  // Cash Out
  const cashOut = async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setCashOutIsLoading(true)
    toast.loading('Cashing out…', { id: `cashOut` })
    try {
      await contractTx(api, activeAccount.address, contract, 'cashOut', {}, [])
      toast.success(`Successfully cashed out`)
    } catch (e) {
      console.error(e)
      toast.error('Error while cashing out. Try again.')
    } finally {
      setCashOutIsLoading(false)
      toast.dismiss(`cashOut`)
      fetchGreeting()
    }
  }

  if (!contract) return null

  return (
    <>
      <div tw="mx-auto flex-grow flex-col space-y-4 text-center max-w-[20rem]">
        <h2 tw="font-mono text-gray-400">Greeter Smart Contract</h2>

        {/* Update Greeting */}
        {!!isConnected && (
          <Card variant="outline" p={4} bgColor="whiteAlpha.100">
            <form>
              <Stack direction="row" spacing={2} align="end">
                <FormControl>
                  <FormLabel>Enter amount</FormLabel>
                  <Input disabled={updateIsLoading} {...form.register('newMessage')} />
                </FormControl>
                <Button
                  mt={4}
                  colorScheme="purple"
                  isLoading={updateIsLoading}
                  disabled={updateIsLoading}
                  type="button"
                  onClick={updateGreeting}
                  size="lg"
                >
                  Deposit
                </Button>
              </Stack>
            </form>
          </Card>
        )}
      </div>
    </>
  )
}
