import { BlockTag, ethers } from "ethers";
import { backendActor, blockchainClients } from "./config";
import { QueryResponse } from "./models";
import { GetEvmStrategy, SpaceEvent } from "./declarations/backend/backend.did";
import { makeEvmActor } from "./service/actor-locator";

export const parseJsonToModel = <T>(query: QueryResponse): T => {
  return JSON.parse(query.Ok) as T;
};

export async function getVotingPower(
  voterAddress: string,
  spaceId: number,
  blockHeight: bigint | string
): Promise<bigint> {
  const res = (await backendActor.get_all_evm_strategies_by_space_id({
    id: spaceId,
  })) as QueryResponse;
  const strategies = parseJsonToModel<GetEvmStrategy[]>(res);

  let power = 0n;

  for (const strategy of strategies) {
    // const tx = await encodeTransaction(
    //   strategy.contractAddress,
    //   strategy.configString.replace(
    //     "$voterAddress",
    //     voterAddress.replace("0x", "")
    //   ),
    //   1
    // );
    // const actor = makeEvmActor();

    // const wallet = ethers.Wallet(

    // )

    // const xx = tx.unsignedSerialized;
    // const hash = ethers.keccak256(xx);

    // actor.eth_sendRawTransaction(tx)
    power += await callStrategy(voterAddress, strategy, blockHeight);
  }

  return power;
}

export async function callStrategy(
  voterAddress: string,
  strategy: GetEvmStrategy,
  blockHeight: BigInt | string = "latest"
): Promise<bigint> {
  const x = strategy.chainId;
  //@ts-ignore
  const result = await blockchainClients[Number(x)].call({
    chainId: strategy.chainId,
    to: strategy.contractAddress,
    blockTag: blockHeight as BlockTag,
    data: strategy.configString.replace(
      "$voterAddress",
      voterAddress.replace("0x", "")
    ),
  });

  return BigInt(result);
}

export async function triggerEvent(
  spaceId: number,
  eventType: number,
  eventData: object
) {
  const events = parseJsonToModel<SpaceEvent[]>(
    (await backendActor.get_all_space_events_by_space_id({
      id: spaceId,
    })) as QueryResponse
  );

  for (const event of events) {
    if (event.eventtype !== eventType) {
      continue;
    }

    let payload = event.payload;
    for (const key in eventData) {
      //@ts-ignore
      payload = payload.replace(`$\{${key}\}`, eventData[key]);
    }

    await fetch(event.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });
  }
}

export async function encodeTransaction(
  to: string,
  data: string,
  chainId: number
) {
  return ethers.Transaction.from({
    to,
    data,
    chainId,
  });
}
