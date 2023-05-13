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
          <ModalBody>add text here</ModalBody>

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
