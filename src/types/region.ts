export type CloudProvider = "AWS" | "Azure";
export type VaultEdition = "Foundation" | "Advanced";
export type VaultTier = "Core" | "Non-Core";

export interface VaultService {
  edition: VaultEdition;
  tier: VaultTier;
}

export interface Region {
  id: string;
  name: string;
  provider: CloudProvider;
  coords: [number, number];
  aliases: string[];
  services: {
    vdc_vault: VaultService[];
  };
}
