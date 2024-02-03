use anchor_lang::prelude::*;

use solana_program::{program::invoke, system_instruction};

declare_id!("8B9VcQmn65FYQmWjEvmyEL2D2CiMr2oacoaQstmVuXWV");

const FEE_RECEIVER_ACCOUNT: &str = "8eTKgcgBERz1MGiQALfZjkuAY6Fz79UtziNsqptPkHEd";

#[program]
pub mod football_squares {
    use super::*;

    pub fn create_game(ctx: Context<CreateGame>, cost_per_square: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.owner = *ctx.accounts.user.key;
        game.cost_per_square = cost_per_square;
        game.game_status = GameStatus::Open;
        game.squares = vec![
            Square {
                owner: None,
                x_axis: 0,
                y_axis: 0
            };
            100
        ]; // Assuming a 10x10 grid

        Ok(())
    }

    pub fn purchase_square(ctx: Context<PurchaseSquare>, square_indices: Vec<u8>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.game_status == GameStatus::Open, ErrorCode::GameClosed);

        let total_cost = calculate_total_cost(game.cost_per_square, square_indices.len());
        let fee = calculate_fee(total_cost, 6.9);
        let amount_to_game = total_cost - fee;

        for &square_index in &square_indices {
            require!(square_index < 100, ErrorCode::InvalidSquareIndex);
            let square = &mut game.squares[square_index as usize];
            require!(square.owner.is_none(), ErrorCode::SquareAlreadyPurchased);
            square.owner = Some(*ctx.accounts.user.key);
        }

        let game_transfer_instruction = system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.game.key(),
            amount_to_game,
        );
        invoke(
            &game_transfer_instruction,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.game.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let fee_receiver_pubkey = FEE_RECEIVER_ACCOUNT.parse::<Pubkey>().unwrap();

        let fee_transfer_instruction =
            system_instruction::transfer(&ctx.accounts.user.key(), &fee_receiver_pubkey, fee);
        invoke(
            &fee_transfer_instruction,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn finalize_game(ctx: Context<FinalizeGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.game_status == GameStatus::Open, ErrorCode::GameNotOpen);
        require!(
            game.squares.iter().all(|s| s.owner.is_some()),
            ErrorCode::NotAllSquaresPurchased
        );

        // Use the current slot as the seed for randomness
        let slot = Clock::get()?.slot;

        let mut x_numbers: Vec<u8> = (0..10).collect();
        let mut y_numbers: Vec<u8> = (0..10).collect();

        // Custom shuffle function using xorshift64star
        shuffle(&mut x_numbers, slot);
        shuffle(&mut y_numbers, slot + 1); // Use a different seed for y

        for i in 0..10 {
            for j in 0..10 {
                let square = &mut game.squares[i * 10 + j];
                square.x_axis = x_numbers[i];
                square.y_axis = y_numbers[j];
            }
        }

        game.game_status = GameStatus::Finalized;

        Ok(())
    }

    pub fn update_scores(
        ctx: Context<UpdateScores>,
        quarter: u8,
        home: u8,
        away: u8,
    ) -> Result<()> {
        let contract_owner = &ctx.accounts.owner;
        require!(
            contract_owner.key() == ctx.accounts.owner.key(),
            ErrorCode::Unauthorized
        );

        let scores = &mut ctx.accounts.scores;

        // Update scores based on the quarter
        match quarter {
            1 => {
                scores.first_quarter_scores = QuarterScores {
                    home: home,
                    away: away,
                }
            }
            2 => {
                scores.second_quarter_scores = QuarterScores {
                    home: home,
                    away: away,
                }
            }
            3 => {
                scores.third_quarter_scores = QuarterScores {
                    home: home,
                    away: away,
                }
            }
            4 => {
                scores.fourth_quarter_scores = QuarterScores {
                    home: home,
                    away: away,
                }
            }
            5 => {
                scores.final_scores = QuarterScores {
                    home: home,
                    away: away,
                }
            }
            _ => return Err(ErrorCode::InvalidQuarter.into()),
        }

        Ok(())
    }

    // pub fn distribute_winnings(ctx: Context<DistributeWinnings>, quarter: u8) -> Result<()> {
    //     // Directly access immutable fields before mutable borrow
    //     let game_balance = ctx.accounts.game.to_account_info().lamports();
    //     let game_key = *ctx.accounts.game.to_account_info().key;

    //     // Now perform the mutable borrow
    //     let game = &mut ctx.accounts.game;

    //     require!(
    //         game.game_status == GameStatus::Finalized,
    //         ErrorCode::GameNotFinalized
    //     );

    //     // Since we've completed the immutable borrow operations above, we can now proceed with mutable operations
    //     let payout_per_winner = game_balance / 5; // Example logic

    //     let winner_pubkey = determine_quarter_winner(game, quarter)?;
    //     if let Some(winner_pubkey) = winner_pubkey {
    //         let transfer_instruction =
    //             system_instruction::transfer(&game_key, &winner_pubkey, payout_per_winner);

    //         invoke(
    //             &transfer_instruction,
    //             &[
    //                 ctx.accounts.game.to_account_info(),
    //                 ctx.accounts.winner.to_account_info(), // Assuming this dynamically determines the winner
    //                 ctx.accounts.system_program.to_account_info(),
    //             ],
    //         )?;

    //         // Mark the quarter as paid to prevent double payouts
    //         mark_quarter_paid(game, quarter)?;
    //     }

    //     Ok(())
    // }

    // pub fn check_scores(ctx: Context<CheckScores>) -> Result<()> {
    //     let game = &mut ctx.accounts.game;
    //     require!(
    //         game.game_status == GameStatus::Finalized,
    //         ErrorCode::GameNotFinalized
    //     );

    //     // Logic to interact with the oracle and fetch the scores
    //     // Determine the winners based on the fetched scores
    //     // Distribute the winnings from the escrow account

    //     Ok(())
    // }

    // pub fn cancel_game(ctx: Context<CancelGame>) -> Result<()> {
    //     let game = &mut ctx.accounts.game;
    //     require!(
    //         game.owner == *ctx.accounts.user.key,
    //         ErrorCode::NotGameOwner
    //     );
    //     require!(
    //         game.game_status != GameStatus::Finalized,
    //         ErrorCode::GameAlreadyFinalized
    //     );

    //     // Logic to refund the purchases to each user
    //     // Return the rent to the game owner
    //     // Update the game status to Closed

    //     Ok(())
    // }

}

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(init, payer = user, space = 3730)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseSquare<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    // Additional accounts and constraints needed for finalization
}

#[derive(Accounts)]
pub struct UpdateScores<'info> {
    #[account(mut)]
    pub scores: Account<'info, Scores>,
    pub owner: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct QuarterScores {
    pub home: u8,
    pub away: u8,
}

#[account]
pub struct Scores {
    pub first_quarter_scores: QuarterScores,
    pub second_quarter_scores: QuarterScores,
    pub third_quarter_scores: QuarterScores,
    pub fourth_quarter_scores: QuarterScores,
    pub final_scores: QuarterScores,
}

// #[derive(Accounts)]
// pub struct CheckScores<'info> {
//     pub game: Account<'info, Game>,
//     // Accounts and constraints for score checking
// }

// #[derive(Accounts)]
// pub struct CancelGame<'info> {
//     #[account(mut)]
//     pub game: Account<'info, Game>,
//     // Additional accounts and constraints for game cancellation
// }

#[account]
pub struct Game {
    pub owner: Pubkey,
    pub cost_per_square: u64,
    pub game_status: GameStatus,
    pub squares: Vec<Square>,
    pub quarter_scores: [QuarterScores; 5], // Added: Scores for each quarter, including the final score
    pub quarter_winners: [Option<Pubkey>; 5], // Added: Winner for each quarter
    pub quarter_paid: [bool; 5], // Added: Whether the payout for each quarter has been made
}

#[derive(PartialEq, Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub enum GameStatus {
    Open,
    Closed,
    Finalized,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Square {
    pub owner: Option<Pubkey>,
    pub x_axis: u8,
    pub y_axis: u8,
}

// #[derive(Accounts)]
// pub struct DistributeWinnings<'info> {
//     #[account(mut)]
//     pub game: Account<'info, Game>,
//     /// CHECK: Only used for SOL transfer, no need to deserialize account data.
//     #[account(mut)]
//     pub winner: AccountInfo<'info>,
//     pub system_program: Program<'info, System>,
// }

// Define error codes for the program
#[error_code]
pub enum ErrorCode {
    #[msg("The game is not open for purchases.")]
    GameClosed,
    #[msg("Invalid square index.")]
    InvalidSquareIndex,
    #[msg("This square has already been purchased.")]
    SquareAlreadyPurchased,
    #[msg("Only program owner can update scores.")]
    Unauthorized,
    #[msg("Should be a number 1-5, where 5 is final score.")]
    InvalidQuarter,
    #[msg("Game's not open.")]
    GameNotOpen,
    #[msg("Can't finalize, not all squares are occupied.")]
    NotAllSquaresPurchased,
    #[msg("Can't distribute winnings, game not finalized.")]
    GameNotFinalized,
    QuarterAlreadyPaid,
}

fn calculate_total_cost(cost_per_square: u64, num_squares: usize) -> u64 {
    cost_per_square * (num_squares as u64)
}

fn calculate_fee(amount: u64, fee_percentage: f64) -> u64 {
    (amount as f64 * (fee_percentage / 100.0)).round() as u64
}

fn xorshift64star(seed: u64) -> u64 {
    let mut x = seed;
    x ^= x << 12;
    x ^= x >> 25;
    x ^= x << 27;
    x = (x as u128 * 0x2545F4914F6CDD1D) as u64;
    x
}

fn shuffle(numbers: &mut Vec<u8>, seed: u64) {
    let mut rng_seed = seed;
    for i in (1..numbers.len()).rev() {
        rng_seed = xorshift64star(rng_seed); // Generate a new random number
        let j = (rng_seed % (i + 1) as u64) as usize; // Simple modulo for the index
        numbers.swap(i, j);
    }
}

// Placeholder function to calculate winners
// Adapt this function based on your game's logic
fn calculate_winners(game: &Account<Game>) -> Vec<Pubkey> {
    // Implement logic to determine winners based on the game state
    // Return a vector of AccountInfo representing the winners
    Vec::new()
}

// Placeholder function to calculate the winning amount for a winner
// Adapt this function based on your game's prize distribution logic
fn calculate_winning_amount(game: &Account<Game>, winner: &AccountInfo) -> u64 {
    // Implement logic to calculate the amount of winnings for a given winner
    0
}

// fn determine_quarter_winner(game: &Game, quarter: u8) -> Result<Option<Pubkey>> {
//     let quarter_index = quarter as usize;
//     // Ensure the quarter index is within bounds
//     if quarter_index == 0 || quarter_index > game.quarter_scores.len() {
//         return Err(ErrorCode::InvalidQuarter.into());
//     }

//     let scores = game.quarter_scores[quarter_index - 1];
//     let last_digit_niners = scores.niners % 10;
//     let last_digit_chiefs = scores.chiefs % 10;

//     // Iterate over squares to find the matching square
//     for square in &game.squares {
//         if square.x_axis == last_digit_niners && square.y_axis == last_digit_chiefs {
//             return Ok(square.owner);
//         }
//     }

//     // If no matching square is found, return None
//     Ok(None)
// }

// fn mark_quarter_paid(game: &mut Game, quarter: u8) -> Result<()> {
//     let quarter_index = quarter as usize;
//     // Ensure the quarter index is within bounds and not already marked as paid
//     if quarter_index == 0
//         || quarter_index > game.quarter_paid.len()
//         || game.quarter_paid[quarter_index - 1]
//     {
//         return Err(ErrorCode::QuarterAlreadyPaid.into());
//     }

//     game.quarter_paid[quarter_index - 1] = true;
//     Ok(())
// }
