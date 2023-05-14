import { env } from '@config/environment'
import { SubstrateDeployment } from '@scio-labs/use-inkathon'

export enum ContractIds {
  Greeter = 'greeter',
  Treasury = 'treasury',
  PolNFT = 'pol_nft',
}

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  const networks = env.supportedChains
  const deployments = networks
    .map(async (network) => [
      {
        contractId: ContractIds.Greeter,
        networkId: network,
        abi: await import(`@inkathon/contracts/deployments/greeter/metadata.json`),
        address: (await import(`@inkathon/contracts/deployments/greeter/${network}.ts`)).address,
      },
      {
        contractId: ContractIds.Treasury,
        networkId: network,
        abi: await import(`@inkathon/contracts/deployments/treasury/metadata.json`),
        address: (await import(`@inkathon/contracts/deployments/treasury/${network}.ts`)).address,
      },
      {
        contractId: ContractIds.PolNFT,
        networkId: network,
        abi: await import(`@inkathon/contracts/deployments/pol_nft/metadata.json`),
        address: (await import(`@inkathon/contracts/deployments/pol_nft/${network}.ts`)).address,
      },
    ])
    .reduce(async (acc, curr) => [...(await acc), ...(await curr)], [] as any)
  return deployments
}
