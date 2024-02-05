se anchor_lang::prelude::*;

use solana_program::pubkey;
use solana_program::{program::invoke, system_instruction};

declare_id!("8B9VcQmn65FYQmWjEvmyEL2D2CiMr2oacoaQstmVuXWV");

const FEE_RECEIVER_ACCOUNT: &str = "8eTKgcgBERz1MGiQALfZjkuAY6Fz79UtziNsqptPkHEd";
const ADMIN_PUBKEY: &Pubkey = &pubkey!("3iGJM28vywNTUt5hZgHjri5LEzeRBevE75EbGY7wakJA");

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
                home_team_index: 0,
                away_team_index: 0
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
        let amount_to_game = total_cost + fee;

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

        // let fee_receiver_pubkey = FEE_RECEIVER_ACCOUNT.parse::<Pubkey>().unwrap();

        // let fee_transfer_instruction =
        //     system_instruction::transfer(&ctx.accounts.user.key(), &fee_receiver_pubkey, fee);
        // invoke(
        //     &fee_transfer_instruction,
        //     &[
        //         ctx.accounts.user.to_account_info(),
        //         ctx.accounts.system_program.to_account_info(),
        //     ],
        // )?;

        Ok(())
    }

    pub fn finalize_game(ctx: Context<FinalizeGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let user = &ctx.accounts.user;

        require!(game.game_status == GameStatus::Open, ErrorCode::GameNotOpen);
        require!(
            game.squares.iter().all(|s| s.owner.is_some()),
            ErrorCode::NotAllSquaresPurchased
        );
        require!(game.owner == user.key(), ErrorCode::Unauthorized);

        // Use the current slot as the seed for randomness
        let slot = Clock::get()?.slot;

        // Generate and shuffle indices for the home and away teams
        let mut home_indices: Vec<u8> = (0..10).collect();
        let mut away_indices: Vec<u8> = (0..10).collect();
        shuffle(&mut home_indices, slot);
        shuffle(&mut away_indices, slot + 1);

        // Assign the shuffled indices to the game
        game.home_team_indices = home_indices;
        game.away_team_indices = away_indices;

        let home_team_indices = game.home_team_indices.clone();
        let away_team_indices = game.away_team_indices.clone();

        // Assign shuffled indices to each square
        for i in 0..10 {
            for j in 0..10 {
                let square_index = i * 10 + j;
                let square = &mut game.squares[square_index];
                square.home_team_index = home_team_indices[i];
                square.away_team_index = away_team_indices[j];
            }
        }

        game.game_status = GameStatus::Finalized;

        Ok(())
    }

    pub fn initialize_scores(ctx: Context<InitializeScores>) -> Result<()> {
        let scores = &mut ctx.accounts.scores;
        // Initialize scores with default values
        Ok(())
    }

    pub fn update_scores(
        ctx: Context<UpdateScores>,
        quarter: u8,
        home: u8,
        away: u8,
    ) -> Result<()> {
        require_keys_eq!(
            *ADMIN_PUBKEY,
            *ctx.accounts.admin.key,
            ErrorCode::Unauthorized
        );

        let scores = &mut ctx.accounts.scores;

        // Update scores based on the quarter
        match quarter {
            1 => {
                scores.first_quarter_scores = QuarterScores {
                    home: Some(home), // Wrapping with Some()
                    away: Some(away), // Wrapping with Some()
                }
            }
            2 => {
                scores.second_quarter_scores = QuarterScores {
                    home: Some(home), // Wrapping with Some()
                    away: Some(away), // Wrapping with Some()
                }
            }
            3 => {
                scores.third_quarter_scores = QuarterScores {
                    home: Some(home), // Wrapping with Some()
                    away: Some(away), // Wrapping with Some()
                }
            }
            4 => {
                scores.fourth_quarter_scores = QuarterScores {
                    home: Some(home), // Wrapping with Some()
                    away: Some(away), // Wrapping with Some()
                }
            }
            5 => {
                scores.final_scores = QuarterScores {
                    home: Some(home), // Wrapping with Some()
                    away: Some(away), // Wrapping with Some()
                }
            }
            _ => return Err(ErrorCode::InvalidQuarter.into()),
        }

        Ok(())
    }

    pub fn calculate_winners(ctx: Context<CalculateWinners>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let scores = &ctx.accounts.scores;

        // Ensure the game is in the correct state to calculate winners
        require!(game.game_status == GameStatus::Open, ErrorCode::GameNotOpen);

        // Update the winners for each quarter based on available scores
        if update_quarter_winners(game, scores) {
            game.game_status = GameStatus::GameOver;
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
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateScores<'info> {
    #[account(mut)]
    pub scores: Account<'info, Scores>,
    pub admin: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct QuarterScores {
    pub home: Option<u8>, // Updated to be nullable
    pub away: Option<u8>, // Updated to be nullable
}

#[derive(Accounts)]
pub struct InitializeScores<'info> {
    #[account(init, payer = user, space = 8 + 536 + /* Fixed size for other fields */)]
    pub scores: Account<'info, Scores>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[account]
pub struct Scores {
    pub first_quarter_scores: QuarterScores,
    pub second_quarter_scores: QuarterScores,
    pub third_quarter_scores: QuarterScores,
    pub fourth_quarter_scores: QuarterScores,
    pub final_scores: QuarterScores,
}

#[derive(Accounts)]
pub struct CalculateWinners<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub scores: Account<'info, Scores>,
    // Ensure that only an authorized user or the game owner can calculate winners
    pub authority: Signer<'info>,
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
    pub home_team_indices: Vec<u8>, // Stores shuffled indices for the home team
    pub away_team_indices: Vec<u8>, // Stores shuffled indices for the away team
    pub scores_account: Pubkey,     // Reference to the Scores account
    pub quarter_winners: [Option<Pubkey>; 5], // Winner for each quarter
}

#[derive(PartialEq, Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub enum GameStatus {
    Open,
    Closed,
    Finalized,
    GameOver,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Square {
    pub owner: Option<Pubkey>,
    pub home_team_index: u8,
    pub away_team_index: u8,
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

fn update_quarter_winners(game: &mut Account<Game>, scores: &Account<Scores>) -> bool {
    // Iterate through each quarter's scores and update the game's quarter winners accordingly
    let quarters_scores = [
        scores.first_quarter_scores,
        scores.second_quarter_scores,
        scores.third_quarter_scores,
        scores.fourth_quarter_scores,
        scores.final_scores, // Assuming this is how you represent the final scores
    ];

    for (quarter_index, quarter_scores) in quarters_scores.iter().enumerate() {
        // Check if both home and away scores are available for this quarter
        if let Some(quarter_scores) = quarter_scores {
            // Calculate the mod 10 of home and away scores to determine the winning square
            let home_mod = quarter_scores.home.unwrap_or(0) % 10;
            let away_mod = quarter_scores.away.unwrap_or(0) % 10;

            // Find the owner of the square that matches the winning condition
            let mut found_winner = false;
            for square in &game.squares {
                if square.home_team_index == home_mod && square.away_team_index == away_mod {
                    // Update the winner for this quarter
                    game.quarter_winners[quarter_index] = square.owner;
                    found_winner = true;
                    break; // Assuming only one winner per quarter
                }
            }

            // If no winner is found for a square, it means the scores were not set for this quarter
            if !found_winner {
                break; // Stop processing further quarters if no scores are available for the current one
            }
        } else {
            // No scores available for this quarter, stop processing further
            break;
        }
    }

    matches!(last_scored_quarter, Some(4))
}