use anchor_lang::prelude::*;

use crate::errors::PartyVoteError;
use crate::state::{Party, VoterRecord};

pub fn handler(ctx: Context<VoteParty>, _party_index: u64) -> Result<()> {
    let voter_record = &mut ctx.accounts.voter_record;
    let party = &mut ctx.accounts.party;

    require!(!voter_record.voted, PartyVoteError::AlreadyVoted);

    party.vote_count = party.vote_count.checked_add(1).unwrap();

    voter_record.voter = ctx.accounts.voter.key();
    voter_record.party = party.key();
    voter_record.voted = true;

    Ok(())
}

#[derive(Accounts)]
#[instruction(party_index: u64)]
pub struct VoteParty<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(
        mut,
        seeds = [b"party", &party_index.to_le_bytes()],
        bump = party.bump
    )]
    pub party: Account<'info, Party>,

    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + VoterRecord::LEN,
        seeds = [b"vote", party.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub voter_record: Account<'info, VoterRecord>,

    pub system_program: Program<'info, System>,
}