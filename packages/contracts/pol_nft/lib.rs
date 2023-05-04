#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod pol_nft {

    use ink::codegen::{EmitEvent, Env};
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

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct PolNft {
        //what account has what NFTs
        #[storage_field]
        psp34: psp34::Data<enumerable::Balances>,

        #[storage_field]
        ownable: ownable::Data,
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
            _instance
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
