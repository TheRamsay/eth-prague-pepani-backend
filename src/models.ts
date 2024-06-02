export type Strategy = {
    name: string;
    description: string;
}

export type EvmStrategy = Strategy & {
    chainId: number;
    contractAddress: string;
    configString: string;
}

export type VoteMessage = {
    voterAddress: string;
    proposalId: number;
    spaceId: number;
    proposalOptionId: number;
    blockHeight: string | null;
}


export type EventData = {
    eventType: number;
    webhookUrl: string;
    payload: string;
    spaceId: number;
}

export type InsertSpace = {
    websiteLink : string,
    name : string,
    minVoteRole : number,
    iconLink : string,
    voteDuration : number,
    voteDelay : number,
    minVotePower : bigint,
    quorum : number,
  }
export type VoteData = {
    signature: string;
    message: VoteMessage;
}

export type QueryResponse = {
    Ok: string
};

export type GetPowerRequest = {
    voterAddress: string;
    spaceId: number;
}