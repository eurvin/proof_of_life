import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { FC } from 'react'
import 'twin.macro'

export const AboutUs: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button onClick={onOpen}>About Us</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>About team Zink</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Team Zink was formed to build Zn, a hugely innovative platform for creating and
            transferring Value Streams on-chain. Our aim is to support a payment stream over a
            number of iterations that can be claimed by the recipient when each iteration becomes
            claimable, trustlessly.
            <br />
            Iterations can be regular or not, each payment can be equal or can vary. Streams are
            created and wrapped in an NFT, that is then transferred to a recipient owner. The owner
            can claim each payment after it falls due. The NFT by default is valueless; the value
            resides in the stream it contains.
            <br />
            The diverse use-cases vary from payment streams to artists, high-finance bond coupons
            with balloon payments, from loyalty schemes to teaching children about savings and
            interest when given regular pocket money (allowance).
            <div>
              The first application using Zn is this fun but practical Proof-of-Life, for parents of
              late teen / early 20s children that live away from home. They may be in 3rd level
              education or travelling, and may not contact home as often as parents would like!
              <br />
              Proof of Life allows parents to give regular payments, but when the child claims the
              payment, the adult sees that it was claimed, and knows that the child is alive and
              well!
            </div>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
