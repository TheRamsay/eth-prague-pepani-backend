import { ethers } from "ethers";
import { makeActor } from "./service/actor-locator";
import { createActor } from "./declarations";

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

// export const blockchainClient = new ethers.JsonRpcProvider(process.env.CHAIN!)
export const actor = makeActor("fbzua-hiaaa-aaaag-albxa-cai", createActor);