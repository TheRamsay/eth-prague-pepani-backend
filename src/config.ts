import { ethers } from "ethers";
import { makeActor } from "./service/actor-locator";
import { createActor } from "./declarations";

require('dotenv').config();

export const blockchainClient = new ethers.JsonRpcProvider(process.env.CHAIN!)
export const actor = makeActor("fbzua-hiaaa-aaaag-albxa-cai", createActor);