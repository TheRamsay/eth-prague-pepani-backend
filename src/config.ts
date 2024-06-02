import { ethers } from "ethers";
import { makeBackendActor, makeEvmActor } from "./service/actor-locator";

require('dotenv').config();

export const blockchainClients = {};

Object.keys(process.env)
    .filter(key => key.startsWith('CHAIN_'))
    .forEach(key => {
        const chainId = key.split('_')[1];
        // @ts-ignore
        if (!process.env[key]) {
            console.error(`No url for chain ${chainId}`);
            return;
        }

        // @ts-ignore
        blockchainClients[+chainId] = new ethers.JsonRpcProvider(process.env[key]!);
    });

export const backendActor = makeBackendActor();
export const evmActor = makeEvmActor();