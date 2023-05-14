import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import { useInkathon } from '@scio-labs/use-inkathon'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import 'twin.macro'

export const NFTStreamsMockup: FC = () => {
  const { api, activeAccount, isConnected, activeSigner } = useInkathon()
  const form = useForm<{ iterationsMessage: string }>()
  const [showNewStream, setShowNewStream] = useState<boolean>()

  // Fetch Greeting
  const fetchBalance = async () => {
    if (!api || !isConnected || !activeAccount) return
    toast.dismiss(`update`)
    fetchBalance() //Balance should be updated after the deposit was made.
  }

  const showNewStreamFields = async () => {
    if (!activeAccount || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    setShowNewStream(true)
  }
  const createNewStream = async () => {
    if (!activeAccount || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    toast.success('New Stream Added  (Mockup)')
    setShowNewStream(false)
  }

  if (!isConnected || !activeAccount) return null

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[30rem]">
        <h2 tw="text-left font-mono text-gray-400">My Existing Streams</h2>

        {/* Incoming Streams */}
        {!!isConnected && (
          <Card
            variant="outline"
            p={4}
            bgColor="whiteAlpha.100"
            border={'solid'}
            borderColor={'grey'}
            borderWidth={'0.4'}
          >
            <h4 tw="text-left text-gray-300">Incoming streams</h4>
            <form>
              <Stack direction="row" spacing={4} align="end">
                <FormControl
                  border={'solid'}
                  borderColor={'darkgrey'}
                  borderWidth={'0.1'}
                  padding={'2'}
                >
                  <Button m={2} colorScheme="purple" type="button" disabled={true} padding={'2'}>
                    10 x 5
                  </Button>{' '}
                  <span>&nbsp;from 5sj....49d&nbsp;&nbsp;</span>
                  <div tw="float-right">
                    <Button m={2} colorScheme="purple" type="button" disabled={false} padding={'2'}>
                      Claim Now
                    </Button>
                    <Button m={2} colorScheme="purple" type="button" disabled={false}>
                      Stop
                    </Button>
                  </div>
                </FormControl>
              </Stack>
              {/* Second Incoming */}

              <Stack direction="row" spacing={4} align="end">
                <FormControl
                  border={'solid'}
                  borderColor={'darkgrey'}
                  borderWidth={'0.1'}
                  padding={'2'}
                >
                  <Button m={2} colorScheme="purple" type="button" disabled={true} padding={'2'}>
                    55 x 4
                  </Button>{' '}
                  <span>&nbsp;from 51r....y3k&nbsp;&nbsp;</span>
                  <div tw="float-right">
                    <Button
                      m={2}
                      opacity={'0.4'}
                      colorScheme="purple"
                      type="button"
                      disabled={true}
                      padding={'2'}
                    >
                      In ~ 3 wks
                    </Button>
                    <Button m={2} colorScheme="purple" type="button" disabled={false}>
                      Stop
                    </Button>
                  </div>
                </FormControl>
              </Stack>
            </form>

            <h4 tw="mt-6 text-left text-gray-300">Outgoing streams</h4>
            <form>
              <Stack direction="row" spacing={4} align="end">
                <FormControl
                  border={'solid'}
                  borderColor={'darkgrey'}
                  borderWidth={'0.1'}
                  padding={'2'}
                >
                  <Button m={2} colorScheme="purple" type="button" disabled={true} padding={'2'}>
                    4 x 12
                  </Button>
                  <Button opacity={'0.4'} colorScheme="telegram" type="button" disabled={true}>
                    Claimed 2 days ago by 5gw....lse
                  </Button>
                  <Button m={2} colorScheme="purple" type="button" disabled={false} float={'right'}>
                    Stop
                  </Button>
                </FormControl>
              </Stack>
            </form>
          </Card>
        )}

        {/* Contract Address */}
        <p tw="text-center font-mono text-xs text-gray-600">51csF...ge24j5</p>
      </div>

      <div tw="flex grow flex-col space-y-4 max-w-[25rem]">
        {!!isConnected && !showNewStream && (
          <div>
            <h2 tw="text-left font-mono text-gray-400">New Stream</h2>
            {/* Button to create new stream */}
            <Button mt={4} colorScheme="purple" type="button" onClick={showNewStreamFields}>
              Create New Stream
            </Button>
          </div>
        )}

        {!!isConnected && showNewStream && (
          <div>
            <h4 tw="text-left font-mono text-gray-400">New Stream details</h4>

            <FormControl>
              <FormLabel>Number of payments</FormLabel>
              <Input placeholder={'5'} disabled={false} />
            </FormControl>
            <FormControl>
              <FormLabel>Value per payment</FormLabel>
              <Input placeholder={'70'} disabled={false} />
            </FormControl>
            <FormControl>
              <FormLabel>Weeks between payments</FormLabel>
              <Input placeholder={'4'} disabled={false} />
            </FormControl>
            <FormControl>
              <FormLabel>Payment stream recipient </FormLabel>
              <Input placeholder={'address'} disabled={false} />
            </FormControl>

            <Button mt={4} colorScheme="purple" type="button" onClick={createNewStream}>
              Add this stream
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
