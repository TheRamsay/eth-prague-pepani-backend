import {
  createActor as createBackendActor,
  canisterId as backendCanisterId,
} from "../declarations/backend";

import {
  createActor as createEvmActor,
  canisterId as evmCanisterId,
} from "../declarations/evm_rpc";

export function makeBackendActor() {
  return createBackendActor("fbzua-hiaaa-aaaag-albxa-cai", {
    agentOptions: {
      host: "https://ic0.app",
    },
  });
}

export function makeEvmActor() {
  return createEvmActor("7hfb6-caaaa-aaaar-qadga-cai", {
    agentOptions: {
      host: "https://ic0.app",
    },
  });
}
