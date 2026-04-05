use anchor_lang::prelude::*;

#[account]
pub struct PartyCounter {
    pub next_index: u64,
}

impl PartyCounter {
    pub const LEN: usize = 8; // u64
}

#[account]
pub struct Party {
    pub index: u64,
    pub name: String,
    pub vote_count: u64,
    pub authority: Pubkey,
    pub bump: u8,
}

impl Party {
    pub const MAX_NAME_LEN: usize = 64;

    pub const LEN: usize =
        8 + // index
        4 + Self::MAX_NAME_LEN + // String prefix + content
        8 + // vote_count
        32 + // authority
        1; // bump
}

#[account]
pub struct VoterRecord {
    pub voter: Pubkey,
    pub party: Pubkey,
    pub voted: bool,
}

impl VoterRecord {
    pub const LEN: usize =
        32 + // voter
        32 + // party
        1;   // voted
}