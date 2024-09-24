import { AIProvider } from "./interfaces";
// import { Luma } from './Luma';
// import { OpenAI } from './OpenAI';

const providers: { [key: string]: new () => AIProvider } = {
  // luma: Luma,
  // openai: OpenAI,
};

export function getProviderInstance(providerName: string): AIProvider | null {
  const ProviderClass = providers[providerName.toLowerCase()];
  return ProviderClass ? new ProviderClass() : null;
}

export function getAllProviders(): AIProvider[] {
  return Object.values(providers).map((ProviderClass) => new ProviderClass());
}
