#![cfg_attr(not(feature = "std"), no_std)]
/// much from https://use.ink/datastructures/mapping

#[ink::contract]
mod treasury {
    use ink::storage::Mapping;

    /// Defines the storage of your contract.
    /// This shows addresses / AccountIds and how much they've deposited, as a key/value pair
    #[ink(storage)]
    pub struct Treasury {
        /// Assign a balance to every account
        balances: Mapping<AccountId, Balance>,
        tvl: u128,
    }

    // Event emitted when someone depositted an amount
    #[ink(event)]
    pub struct SuccessfulDeposit {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        new_balance: Option<Balance>,
    }

    // Event emitted when someone withdraw
    #[ink(event)]
    pub struct SuccessfulWithdrawl {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        amount: Option<u128>,
    }

    // The Treasury error types.
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Returned if there are unsufficient funds to withdraw
        NotEnoughFunds,
        /// Returned if the caller doesn't have a balance
        NoFunds,
    }

    impl Treasury {
        //from https://use.ink/macros-attributes/contract
        //Note that ink! constructors are always implicitly payable and thus
        //  cannot be flagged as such.
        #[ink(constructor)] //#[ink(constructor, payable)]
        pub fn new() -> Self {
            let balances = Mapping::default();
            let tvl: u128 = 0;
            Self { balances, tvl }
        }

        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
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
                new_balance: Some(new_balance),
            })
        }

        /// Withdraw the whole balance from the contract.
        #[ink(message)]
        pub fn withdraw_all(&mut self) -> Result<(), Error> {
            let caller = self.env().caller();
            let balance = self.balances.get(caller).unwrap_or(0);
            if balance == 0 {
                return Err(Error::NoFunds);
            }
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
            let mut _message =
                ink_prelude::format!("Thank you {:?} for withdrawing {:?}", caller, &transfer_amt);
            self.balances.remove(caller);
            if transfer_amt >= balance {
                _message = ink_prelude::format!(
                    "Thank you {:?} for withdrawing full balance of {:?}",
                    caller,
                    balance
                );
                self.env().transfer(caller, balance).unwrap();
                self.tvl -= balance;
            } else {
                //there is some balance remaining
                let remaining_bal = balance - transfer_amt;
                self.balances.insert(caller, &remaining_bal);
                self.env().transfer(caller, transfer_amt).unwrap();
                self.tvl -= transfer_amt;
            }
            ink::env::debug_println!("{}", &_message);
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
        use ink::env::pay_with_call;
        use ink::env::test::*;

        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the new constructor does its job.
        #[ink::test]
        fn new_works() {
            let treasury = Treasury::new();
            assert_eq!(treasury.tvl, 0);
        }

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let treasury = Treasury::default();
            assert_eq!(treasury.tvl, 0);
        }

        /// get_balance should return None if user doesn't have a balance.
        #[ink::test]
        fn deposit_and_get_balance_works() {
            let mut treasury = Treasury::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            // Set the contract as callee and Bob as caller.
            let contract = ink::env::account_id::<ink::env::DefaultEnvironment>();
            set_callee::<ink::env::DefaultEnvironment>(contract);
            set_caller::<ink::env::DefaultEnvironment>(accounts.bob);

            pay_with_call!(treasury.deposit(), 90);

            let new_contract_balance = ink::env::balance::<ink::env::DefaultEnvironment>();
            let new_balance_bob = get_account_balance::<ink::env::DefaultEnvironment>(accounts.bob);

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();

            assert_eq!(new_balance_bob, Ok(910));
            assert_eq!(emitted_events.len(), 1);
            assert_eq!(new_contract_balance, 1000090);
            // calls get balance with Bob and asserts 90 is credited to his account
            assert_eq!(treasury.get_balance(), Some(90));
        }

        // We test if deposits works

        /// We test if the deposit event gets emitted.
        #[ink::test]
        fn deposit_event_works() {
            let mut treasury = Treasury::new();
            treasury.deposit();
            assert_eq!(treasury.get_balance(), Some(0));
            let emitted_events = ink::env::test::recorded_events().count();
            assert_eq!(emitted_events, 1);
        }

        #[ink::test]
        fn returns_error_if_withdraw_0_funds() {
            let mut treasury = Treasury::new();
            treasury.deposit();
            assert_eq!(treasury.withdraw_all(), Err(Error::NoFunds));
        }

        /// Having tested deposit, use deposit to have something to 100 from Bob.
        /// Withdraw 60 and verify that 1) 40 is left, 2) Bob is credited
        #[ink::test]
        fn withdraw_works() {
            let mut treasury = Treasury::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            // Set the contract as callee and Alice as caller.
            let contract = ink::env::account_id::<ink::env::DefaultEnvironment>();
            set_callee::<ink::env::DefaultEnvironment>(contract);
            set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            let init_contract_balance = ink::env::balance::<ink::env::DefaultEnvironment>();
            let init_balance_alice =
                get_account_balance::<ink::env::DefaultEnvironment>(accounts.alice);
            //starting balances
            assert_eq!(init_balance_alice, Ok(1_000_000));
            assert_eq!(init_contract_balance, 1_000_000);
            assert_eq!(treasury.get_balance(), None);
            //transfer in via deposit

            set_callee::<ink::env::DefaultEnvironment>(contract);
            set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            pay_with_call!(treasury.deposit(), 400);
            advance_block::<ink::env::DefaultEnvironment>();

            let post_dep_contract_balance = ink::env::balance::<ink::env::DefaultEnvironment>();
            let post_dep_balance_alice =
                get_account_balance::<ink::env::DefaultEnvironment>(accounts.alice);
            //post-deposit balances
            assert_eq!(post_dep_balance_alice, Ok(1_000_400));
            assert_eq!(post_dep_contract_balance, 1_000_400);
            assert_eq!(treasury.get_balance(), Some(400));

            set_callee::<ink::env::DefaultEnvironment>(contract);
            set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            let remaining_user_bal = pay_with_call!(treasury.withdraw(300), 50);
            advance_block::<ink::env::DefaultEnvironment>();
            let post_withdrawal_contract_balance =
                ink::env::balance::<ink::env::DefaultEnvironment>();
            let post_withdrawal_balance_alice =
                get_account_balance::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(remaining_user_bal, 100);
            assert_eq!(post_withdrawal_balance_alice, Ok(1_000_750));
            assert_eq!(post_withdrawal_contract_balance, 1_000_750);
            assert_eq!(treasury.get_balance(), Some(100));

            /*
            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();

            assert_eq!(new_balance_bob, Ok(900));
            assert_eq!(emitted_events.len(), 1);
            assert_eq!(new_contract_balance, 1000100);
            // calls get balance with Bob and asserts 100 is credited to his account
            assert_eq!(treasury.get_balance(), Some(100));

            //now that the account has 100 in Bob's name, test withdraw
            pay_with_call!(treasury.withdraw(), 100); */
        }
    }
}
