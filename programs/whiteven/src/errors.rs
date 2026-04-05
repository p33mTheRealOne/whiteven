use anchor_lang::prelude::*;

#[error_code]
pub enum PartyVoteError {
    #[msg("Name too long")]
    NameTooLong,

    #[msg("Already voted")]
    AlreadyVoted,
}