use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("CVDGd5GQ1NkKFWogGjg4LcmibPhDf9URu177YkZYYeNi");

#[program]
pub mod whiteven {
    use super::*;

    pub fn create_party(ctx: Context<CreateParty>, name: String) -> Result<()> {
        instructions::create::handler(ctx, name)
    }

    pub fn vote_party(ctx: Context<VoteParty>, party_index: u64) -> Result<()> {
        instructions::vote::handler(ctx, party_index)
    }
}