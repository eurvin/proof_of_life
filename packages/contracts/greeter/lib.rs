#![cfg_attr(not(feature = "std"), no_std)]
/// much from https://use.ink/datastructures/mapping

#[ink::contract]
mod pol_treasury {
    use ink::{env::caller, storage::Mapping};

    /// Defines the storage of your contract.
    /// This shows addresses / AccountIds and how much they've deposited, as a key/value pair
    #[ink(storage)]
    pub struct PolTreasury {
        /// Assign a balance to every account
        owner: AccountId,
        balances: Mapping<AccountId, Balance>,
        tvl: u128,
    }

    // Event emitted when someone depositted an amount
    #[ink(event)]
    pub struct SuccessfulDeposit {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        newBalance: Option<Balance>,
    }

    // Event emitted when someone withdraw
    #[ink(event)]
    pub struct SuccessfulWithdrawl {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        amount: Option<u128>,
    }

    // The PolTreasury error types.
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Returned if there are unsufficient funds to withdraw
        NotEnoughFunds,
        /// Returned if someone but the owner and the approved account tries to withdraw
        NoWithdrawlPermission,
    }

    impl PolTreasury {
        //from https://use.ink/macros-attributes/contract
        //Note that ink! constructors are always implicitly payable and thus
        //  cannot be flagged as such.
        #[ink(constructor)] //#[ink(constructor, payable)]
        pub fn new(owner: AccountId) -> Self {
            let owner = owner;
            let balances = Mapping::default();
            let tvl: u128 = 0;
            Self {
                owner,
                balances,
                tvl,
            }
        }

        /// Retrieve the balance of the caller.
        #[ink(message)]
        pub fn get_balance(&self) -> Option<Balance> {
            let caller = self.env().caller();
            return self.balances.get(caller);
        }

        /// Credit more money to the contract.
        #[ink(message, payable)]
        pub fn deposit(&mut self) {
            let caller = self.env().caller();
            //find current balance
            let balance = self.balances.get(caller).unwrap_or(0);

            let extra_value = self.env().transferred_value();
            let new_balance = balance + extra_value;
            let _message =
                ink_prelude::format!("Thank you {:?} for depositing {:?}", caller, extra_value);
            ink::env::debug_println!("{}", &_message);
            //need to re-insert the new amount.
            self.balances.insert(caller, &new_balance);
            self.tvl += extra_value;
            self.env().emit_event(SuccessfulDeposit {
                from: Some(caller),
                newBalance: Some(new_balance),
            })
        }

        /// Withdraw the whole balance from the contract.
        #[ink(message)]
        pub fn withdraw_all(&mut self) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::NoWithdrawlPermission);
            }
            let balance = self.balances.get(caller).unwrap();
            self.balances.remove(caller);
            self.env().transfer(caller, balance).unwrap();
            self.tvl -= balance;
            self.env().emit_event(SuccessfulWithdrawl {
                from: Some(caller),
                amount: Some(balance),
            });
            Ok(())
        }

        /// Withdraw some of the balance from the contract.
        /// Return the remaining balance
        #[ink(message)]
        pub fn withdraw(&mut self, transfer_amt: Balance) -> u128 {
            let caller = self.env().caller();
            let balance = self.balances.get(caller).unwrap();
            if transfer_amt >= balance {
                self.balances.remove(caller);
                self.env().transfer(caller, balance).unwrap();
                self.tvl -= balance;
            } else {
                //there is some balance remaining
                self.env().transfer(caller, transfer_amt).unwrap();
                self.tvl -= transfer_amt;
            }
            self.env().emit_event(SuccessfulWithdrawl {
                from: Some(caller),
                amount: Some(balance),
            });
            //return the remaining balance, if any
            return self.balances.get(caller).unwrap_or(0);
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        use ink::env::test::EmittedEvent;

        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn new_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let pol_treasury = PolTreasury::new(accounts.alice);
            assert_eq!(pol_treasury.tvl, 0);
        }

        // Test deposit / withdraw of our contract.
        /*
        #[ink::test]
        fn it_works() {
            let mut pol_treasury = PolTreasury::new();
            pol_treasury.deposit(100);
            assert_eq!(pol_treasury.get_balance(), 100);
            pol_treasury.withdraw(50);
            assert_eq!(pol_treasury.get_balance(), 50);
        }*/

        // We test if deposits works

        #[ink::test]
        fn deposit_event_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut pol_treasury = PolTreasury::new(accounts.alice);
            pol_treasury.deposit();
            assert_eq!(pol_treasury.get_balance(), Some(0));
            let emitted_events = ink::env::test::recorded_events().count();
            assert_eq!(emitted_events, 1);
        }
    }
}
