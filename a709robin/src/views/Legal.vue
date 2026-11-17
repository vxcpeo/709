<script setup>
import { brand } from "../config/brand";
import { network } from "../composables/wallet";
</script>

<template>
  <div class="orb-frame">
    <div class="orb-halo" aria-hidden="true">
      <svg viewBox="0 0 640 640" fill="none" focusable="false">
        <circle cx="320" cy="320" r="308" stroke="currentColor" stroke-dasharray="2 10" />
        <circle cx="320" cy="320" r="232" stroke="currentColor" stroke-dasharray="96 44" />
        <circle cx="320" cy="320" r="152" stroke="currentColor" />
        <circle cx="470" cy="168" r="7" fill="currentColor" stroke="none" />
        <circle cx="176" cy="438" r="5" fill="currentColor" stroke="none" />
      </svg>
    </div>
    <div class="orb-scene">
    <header class="orb-lede">
      <p class="orb-kicker">PRODUCT TERMS / PRIVACY</p>
      <h1>Know the terms.</h1>
      <p>
        How to use this experimental release, and what information is involved
        when you do. Updated September 17, 2026.
      </p>
    </header>

    <div class="orb-legal__summary" role="group" aria-label="Key facts">
      <div><span>Environment</span><strong>Testnet tokens only</strong></div>
      <div>
        <span>Authorization</span><strong>Your wallet, your signatures</strong>
      </div>
      <div><span>Records</span><strong>Public onchain data</strong></div>
    </div>
    <article class="orb-legal">
      <div class="orb-notice orb-notice--info">
        {{ brand.name }} currently runs on {{ network.name }}. Use test tokens
        only. The contracts have not been independently audited.
      </div>

      <h2>An experimental product</h2>
      <p>
        {{ brand.name }} provides an interface for creating and managing token
        schedules on a public test network. This release is provided for
        evaluation, without a guarantee of uninterrupted access, correctness or
        token recovery. Network resets, software defects and third-party service
        failures may affect it.
      </p>
      <p>
        Test ETH and the freely mintable tUSD demonstration token have no
        monetary value. tUSD is not a dollar deposit, a backed stablecoin, a
        redemption claim or an investment. Nothing on this site promises returns
        or constitutes financial, investment or legal advice.
      </p>

      <h2>Your wallet and transactions</h2>
      <p>
        Your wallet controls transaction authorization. Check the network, token
        address, recipient, allowance, amount and timing before signing.
        Connecting a wallet does not itself transfer assets. A token approval
        grants the specified contract permission to spend tokens; funding a
        schedule is a separate transaction.
      </p>
      <p>
        The scheduler holds funded tokens under immutable rules. There is no
        administrator override or recovery function. When enabled at creation,
        the sender can cancel before or during the schedule. Cancellation stops
        future vesting and refunds the unvested amount; vested tokens remain
        claimable by the recipient after subtracting previous claims.
        Noncancelable schedules cannot be canceled. Recipient transfers move the
        remaining entitlement to the new wallet, including an unclaimed vested
        entitlement after cancellation. Transactions confirmed by the network
        cannot be reversed through this website.
      </p>
      <p>
        The testnet scheduler charges no protocol fee. Network transactions
        still require test ETH for gas. This release is not an independently
        audited production service and must not be used with real funds.
      </p>

      <h2>Public blockchain information</h2>
      <p>
        Wallet addresses, balances, allowances, schedule details and submitted
        transactions are public blockchain information. The app reads this
        information to display your workspace and transaction status. Other
        people can inspect it through the network or a block explorer. A wallet
        address is not an anonymous identity guarantee.
      </p>
      <p>
        The app does not ask for your seed phrase or private key. Wallet
        approval and signing take place in your wallet. Disconnecting the
        interface does not revoke existing token allowances or remove records
        from the blockchain; use your wallet’s tools to manage permissions.
      </p>

      <h2>Browser data and external services</h2>
      <p>
        This version does not include application analytics, advertising
        trackers, an email signup database or a user-account system. The
        connected-wallet state is used in the browser to operate the interface.
        Your wallet manages its own account access, permissions and storage.
      </p>
      <p>
        The site uses a public RPC endpoint to read blockchain data and submit
        wallet-authorized transactions. RPC providers may receive your IP
        address, requested wallet addresses and other request metadata. Site
        hosting, wallet providers, the external block explorer and faucet may
        also process technical information under their own policies.
      </p>
      <p>
        External links open services with their own privacy practices;
        {{ brand.name }} does not control those services. This interface uses
        self-hosted Manrope with a system-font fallback and does not request
        fonts from a third-party font provider.
      </p>

      <h2>An independent project</h2>
      <p>
        {{ brand.name }} is an independent project built for Robinhood Chain. It
        is not affiliated with, sponsored by or endorsed by Robinhood. Network
        and third-party names identify compatible infrastructure; they do not
        imply a partnership.
      </p>
      <p>
        The business plan includes future product ideas and planning
        assumptions. It does not establish current customers, revenues, security
        certification or a commitment to launch a financial product.
      </p>

      <h2>Updates</h2>
      <p>
        Product updates and release notes are published on
        <a
          class="orb-inline-link"
          :href="brand.xUrl"
          target="_blank"
          rel="noopener noreferrer"
          >X at @{{ brand.handle }}</a
        >. Follow there for deployment and maintenance notices.
      </p>

      <h2>Read the rules before you sign</h2>
      <p>
        The
        <RouterLink class="orb-inline-link" to="/docs">handbook</RouterLink>
        explains the four flows, exact release rules, permissions and deployed
        contract addresses. Consult it before creating a schedule. These pages
        may change as the testnet product evolves; the deployed contract’s rules
        remain those of its published code.
      </p>
    </article>
  </div>
    </div>
</template>

