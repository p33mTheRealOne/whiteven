use anchor_lang::prelude::*;

use crate::errors::PartyVoteError;
use crate::state::{Party, PartyCounter};

pub fn handler(ctx: Context<CreateParty>, name: String) -> Result<()> {
    require!(
        name.as_bytes().len() <= Party::MAX_NAME_LEN,
        PartyVoteError::NameTooLong
    );

    let counter = &mut ctx.accounts.counter;
    let party = &mut ctx.accounts.party;

    let current_index = counter.next_index;

    party.index = current_index;
    party.name = name;
    party.vote_count = 0;
    party.authority = ctx.accounts.authority.key();
    party.bump = ctx.bumps.party;

    counter.next_index = counter
        .next_index
        .checked_add(1)
        .unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct CreateParty<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + PartyCounter::LEN,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, PartyCounter>,

    #[account(
        init,
        payer = authority,
        space = 8 + Party::LEN,
        seeds = [
            b"party".as_ref(),
            &counter.next_index.to_le_bytes()
        ],
        bump
    )]
    pub party: Account<'info, Party>,

    pub system_program: Program<'info, System>,
}