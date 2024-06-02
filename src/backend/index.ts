import { ethers } from 'ethers';
import express, { Request } from 'express';
import { VoteData } from '../models';
import { InsertProposalOptionVote, ProposalOptionVote } from '../declarations/backend/backend.did';
import { encodeTransaction, getVotingPower, triggerEvent } from '../utils';
import { backendActor } from '../config';
import { makeEvmActor } from '../service/actor-locator';
import { ic } from 'azle';
import { managementCanister } from 'azle/canisters/management';
import { QueryResponse, VoteData } from '../models';
import { GetBtcStrategy, GetEvmStrategy, InsertProposalOptionVote, Proposal, ProposalOption, ProposalOptionVote, Space, SpaceEvent } from '../declarations/backend.did';
import { getVotingPower, parseJsonToModel, triggerEvent } from '../utils';
import { actor } from '../config';

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
    res.json("{ message: 'Ahoj pepo' }");
});

app.post("/api/vote", async (req: Request<{}, {}, VoteData>, res) => {
    const messageHash = ethers.hashMessage(JSON.stringify(req.body.message));
    const publicKey = ethers.recoverAddress(messageHash, req.body.signature).toLowerCase();

    console.log("Public key: ", publicKey);
    console.log("Voter address: ", req.body.message.voterAddress);

    if (publicKey !== req.body.message.voterAddress) {
        res.status(400).json({ message: "Address verification failed" });
        return;
    }

    const isEthAddress = req.body.message.voterAddress.startsWith("0x");

    if (!isEthAddress) {
        res.status(400).json({ message: "jebat btc 🤠" });
        return;
    }

    let blockHeight: bigint | string = "latest";

    if (req.body.message.blockHeight) {
        blockHeight = BigInt(req.body.message.blockHeight);
    }

    let power = await getVotingPower(req.body.message.voterAddress, req.body.message.spaceId, blockHeight);
    power = 3n;

    console.log("Voting power: ", power);

    if (power <= 0n) {
        res.status(400).json({ message: "Not enough voting power" });
        return;
    }

    await triggerEvent(req.body.message.spaceId, 0, {
        power: power.toString(),
        voterAddress: req.body.message.voterAddress,
    });

    const newVote: InsertProposalOptionVote = {
        signature: req.body.signature,
        optionId: req.body.message.proposalOptionId,
        voteType: 0,
        votingPower: power,
        userAddress: publicKey,
        timestamp: Math.floor(Date.now() / 1000)
    }

    await backendActor.insert_proposal_option_vote(newVote);

    res.json({ message: publicKey === req.body.message.voterAddress ? "Success" : "Failed" });
});

app.get("/api/power", async (req: Request<{}, {}, {}>, res) => {
    let voterAddress = req.query.voterAddress as string;
    let spaceId = +(req.query.spaceId as string);
    let blockHeight = req.query.blockHeight as string ?? "latest";

    let power = await getVotingPower(voterAddress, spaceId, blockHeight);
    res.json({ votingPower: power.toString() });
});

app.get("/au", async (req: Request<{}, {}, {}>, res) => {

    // ethers.Transaction.from({
    //     to
    // })
    // const a = await makeEvmActor();
    // a.eth_sendRawTransaction()

    // const x = await ic.call(managementCanister.ecdsa_public_key, {args: [
    //     {
    //         // canister_id: [],
    //         // method_name: "ecdsa_public_key",
    //     }
    // ]});

    // console.log(x);

    res.json({ message: "Ahoj pepo" });
});

app.get("/api/spaces", async (req: Request<{}, {}, {}>, res) => {
    const query = await actor.query_all_spaces({limit:99999, offset:0}) as QueryResponse;

    const spaces = parseJsonToModel<Space[]>(query);

    
    res.json(spaces);
});

app.get("/api/spaces/:id", async (req, res) => {
    const id = req.params.id
    const query = await actor.query_spaces_by_id({id: +id}) as QueryResponse;

    const spaces = parseJsonToModel<Space>(query);

    
    res.json(spaces);
});

app.get("/api/spaces/:id/proposals", async (req, res) => {
    const id = req.params.id
    const query = await actor.query_proposals_by_space_id({id: +id}) as QueryResponse;

    const spaces = parseJsonToModel<Proposal[]>(query);

    
    res.json(spaces);
});

app.get("/api/spaces/:id/events", async (req, res) => {
    const id = req.params.id
    const query = await actor.get_all_space_events_by_space_id({id: +id}) as QueryResponse;

    const events = parseJsonToModel<SpaceEvent[]>(query);

    
    res.json(events);
});

app.get("/api/spaces/:id/evm", async (req, res) => {
    const id = req.params.id
    const query = await actor.get_all_evm_strategies_by_space_id({id: +id}) as QueryResponse;

    const events = parseJsonToModel<GetEvmStrategy[]>(query);

    
    res.json(events);
});

app.get("/api/spaces/:id/btc", async (req, res) => {
    const id = req.params.id
    const query = await actor.get_all_btc_strategies_by_space_id({id: +id}) as QueryResponse;

    const events = parseJsonToModel<GetBtcStrategy[]>(query);

    
    res.json(events);
});


app.get("/api/proposals/:id", async  (req, res) => {
    const id = req.params.id

    const query = await actor.query_proposal_by_id({id: +id}) as QueryResponse;

    const spaces = parseJsonToModel<Proposal>(query);
    
    res.json(spaces);
});

app.get("/api/proposals/:id/votes", async  (req, res) => {
    const id = req.params.id

    const query = await actor.get_proposal_votes_by_proposal_id({id: +id}) as QueryResponse;

    const spaces = parseJsonToModel<ProposalOptionVote[]>(query);
    
    res.json(spaces);
});

app.get("/api/proposals/:id/options", async  (req, res) => {
    const id = req.params.id

    const query = await actor.get_proposal_options_by_proposal_id({id: +id}) as QueryResponse;

    const spaces = parseJsonToModel<ProposalOption[]>(query);
    
    res.json(spaces);
});

app.get("/apievents", async (req, res) => {
    const query = await actor.get_all_space_events() as QueryResponse;

    const events = parseJsonToModel<SpaceEvent[]>(query);

    
    res.json(events);
});

// app.post()

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

