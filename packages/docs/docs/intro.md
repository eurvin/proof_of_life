---
sidebar_position: 1
---

# Proof of Life Intro

Thank you for your interest in **Proof of Life**.
The fun yet practial _Proof of Life_ dApp is designed for parents &
guardians of late teen / early 20s children that live away from home.
These young adults may not yet be fully financially independent (e.g.
in 3rd level education or travelling) so they may require money transfers
at different periods.

Many parents & guardians love hearing from their children when they're away,
yet the children are busy and otherwise independent. So they may not contact
home as often as parents would like!
<br />
This is where Proof of Life shines. It allows parents & guardians to set up a
series of regular payments to a dependent. When the dependent claims the
payment, the adult sees that it was claimed, and so knows that the child is
alive and well!

_Proof of Life_ makes use of WASM smart contracts by _Zink_ for interative value transfer.

## Getting Started

Get started by **opening the dApp**.

### Connect

Connect your wallet on the top right.
You can see your starting account balance of native tokens immediately to the left of the wallet.

## Outgoing Streams

### Deposit

Deposit value your treasury for transfer. You will see that your treasury balance
had changed.

### Create a Stream

Then you can create a stream by clicking on create a stream:

- Set a payment amount, time between payments, number of iterations and recipient address
- Create the stream

This is added to your list of outgoing streams. When a payment is claimed by the
recipient, the dApp shows you that a claim was made.

You can create multiple varying streams, even for the same recipient.

### Incoming Streams.

If you are the lucky recipient of one or more streams, once connected, you can
see the list in your incoming Streams.

- For any streams where a payment iteration is now claimable, you can click claim.
- Streams where a claim cannot yet be made shows the approximate duration until
  the next iteration can be claimed.
- Claiming notifies the payment stream creator that you have claimed.

Or **try Docusaurus immediately** with **[docusaurus.new](https://docusaurus.new)**.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 16.14 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.

## Generate a new site

Generate a new Docusaurus site using the **classic template**.

The classic template will automatically be added to your project after you run the command:

```bash
npm init docusaurus@latest my-website classic
```

You can type this command into Command Prompt, Powershell, Terminal, or any other integrated terminal of your code editor.

The command also installs all necessary dependencies you need to run Docusaurus.

## Start your site

Run the development server:

```bash
cd my-website
npm run start
```

The `cd` command changes the directory you're working with. In order to work with your newly created Docusaurus site, you'll need to navigate the terminal there.

The `npm run start` command builds your website locally and serves it through a development server, ready for you to view at http://localhost:3000/.

Open `docs/intro.md` (this page) and edit some lines: the site **reloads automatically** and displays your changes.
