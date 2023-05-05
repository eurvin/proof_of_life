#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod pol_nft {

    use ink::codegen::{EmitEvent, Env};
    use ink::prelude::vec::Vec;
    // imports from openbrush, as well as the traits, we need these:
    use openbrush::{
        contracts::{
            ownable::*,
            psp34,
            psp34::{
                extensions::{burnable::*, enumerable::*, mintable::*},
                Id,
            },
        },
        traits::Storage, //, String},
    };

    #[ink(event)]
    pub struct TransferEvent {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        id: Id,
    }

    #[ink(event)]
    pub struct ApprovalEvent {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        spender: AccountId,
        id: Option<Id>,
        approved: bool,
    }

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct ValueStreamItem {
        payment_amount: u128, //could be a balance instead of u128
        already_paid: bool,

        //test against self.env().block_number()
        earliest_claimable_block: BlockNumber,
    }

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct PolNft {
        //what account has what NFTs
        #[storage_field]
        psp34: psp34::Data<enumerable::Balances>,

        #[storage_field]
        ownable: ownable::Data,
        // Store the source / originators / payer of the NFT stream
        // These are not the owners, as it's transferred from the original
        //  owner (minter) to enable payment to the new owner (recipient).
        //TODO: check if #[storage_field] is needed. If so, new Trait impl needed.
        psp34_minters: ink::storage::Mapping<AccountId, Vec<Id>>,

        //The value Stream
        //TODO: check if #[storage_field] is needed. If so, new Trait impl needed.
        value_stream: Vec<ValueStreamItem>,
    }

    impl psp34::Internal for PolNft {
        fn _emit_transfer_event(&self, from: Option<AccountId>, to: Option<AccountId>, id: Id) {
            self.env().emit_event(TransferEvent { from, to, id });
        }

        fn _emit_approval_event(
            &self,
            owner: AccountId,
            spender: AccountId,
            id: Option<Id>,
            approved: bool,
        ) {
            self.env().emit_event(ApprovalEvent {
                owner,
                spender,
                id,
                approved,
            });
        }
    }

    impl PSP34 for PolNft {}

    //override the burnable
    impl PSP34Burnable for PolNft {
        #[ink(message)]
        #[openbrush::modifiers(only_owner)]
        fn burn(&mut self, account: AccountId, id: Id) -> Result<(), PSP34Error> {
            self._burn_from(account, id)
        }
    }
    impl PSP34Mintable for PolNft {
        #[ink(message)]
        #[openbrush::modifiers(only_owner)]
        fn mint(&mut self, account: AccountId, id: Id) -> Result<(), PSP34Error> {
            self._mint_to(account, id)
        }
    }

    impl PSP34Enumerable for PolNft {}

    impl PolNft {
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut _instance = Self::default();
            _instance
                ._mint_to(_instance.env().caller(), Id::U8(1))
                .expect("Can mint");
            //create a default stream of 1 item
            let stream_item = ValueStreamItem {
                payment_amount: 84,
                already_paid: false,
                earliest_claimable_block: (_instance.env().block_number() + 100),
            };
            let mut stream_items: Vec<ValueStreamItem> = Vec::new();
            stream_items.push(stream_item);
            _instance.value_stream = stream_items;

            _instance
        }
        #[ink(constructor)]
        pub fn new_with_stream(
            each_payment: u128,
            iterations: u32,
            start_block: BlockNumber,
            blocks_between_payments: u32,
        ) -> Self {
            let mut _instance = Self::default();
            _instance
                ._mint_to(_instance.env().caller(), Id::U8(1))
                .expect("Can mint");

            let mut stream_items: Vec<ValueStreamItem> = Vec::new();

            if iterations <= 0 || each_payment <= 0 {
                //less than 0 payment
                //create a stream of 1 item
                let stream_item = ValueStreamItem {
                    payment_amount: 0,
                    already_paid: true,
                    earliest_claimable_block: start_block,
                };
                stream_items.push(stream_item);
            } else {
                for i in 0..iterations {
                    let payment_block = start_block + (i * blocks_between_payments);
                    let stream_item = ValueStreamItem {
                        payment_amount: each_payment,
                        already_paid: false,
                        earliest_claimable_block: payment_block,
                    };
                    stream_items.push(stream_item);
                }
            }
            _instance.value_stream = stream_items;

            _instance
        }

        ///How many blocks before a claim can be made?
        #[ink(message)]
        pub fn blocks_to_next_claim(&self) -> Option<u32> {
            let num_payments = self.value_stream.len();
            for i in 0..num_payments {
                let item: &ValueStreamItem = self.value_stream.get(i)?;
                if item.already_paid == true {
                    continue;
                }
                let current_block_num = self.env().block_number();
                if item.earliest_claimable_block <= current_block_num {
                    return Some(0);
                } else {
                    let blocks_to_go = current_block_num - item.earliest_claimable_block;
                    return Some(blocks_to_go);
                }
            }
            //We'll reach here if there are no payments left to claim
            return None;
        }
    }
    #[cfg(test)]
    mod tests {

        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the new constructor does its job.
        #[ink::test]
        fn new_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let the_nft_contract = PolNft::new();

            assert_eq!(
                the_nft_contract.owners_token_by_index(accounts.bob, 0u128),
                Err(PSP34Error::TokenNotExists)
            );
        }
    }
}
