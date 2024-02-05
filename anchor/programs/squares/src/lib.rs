use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::pubkey;
use anchor_lang::solana_program::system_instruction;

declare_id!("8B9VcQmn65FYQmWjEvmyEL2D2CiMr2oacoaQstmVuXWV");

#[program]
pub mod football_squares {
    use super::*;

    pub fn create_game_board(ctx: Context<CreateGameBoard>, cost_per_square: u64) -> Result<()> {
        let board = &mut ctx.accounts.board;
        board.creator = *ctx.accounts.creator.key;
        board.cost_per_square = cost_per_square;
        board.status = GameBoardStatus::Open;
        board.squares = vec![
            GameBoardSquare {
                owner: None,
                home_team_index: 0,
                away_team_index: 0
            };
            100
        ]; 
        Ok(())
    }

    pub fn purchase_square(ctx: Context<PurchaseSquare>, square_indices: Vec<u8>) -> Result<()> {
        let board = &mut ctx.accounts.board;
        require!(
            board.status == GameBoardStatus::Open,
            ErrorCode::GameBoardClosed
        );

        let total_cost = board.cost_per_square * square_indices.len() as u64;
        let fee = (total_cost as f64 * 0.069).round() as u64; // TODO
        let amount_to_user = total_cost + fee;

        for &square_index in &square_indices {
            require!(square_index < 100, ErrorCode::InvalidSquareIndex);
            let square = &mut board.squares[square_index as usize];
            require!(square.owner.is_none(), ErrorCode::SquareAlreadyPurchased);
            square.owner = Some(*ctx.accounts.owner.key);
        }

        let game_transfer_instruction = system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &ctx.accounts.board.key(),
            amount_to_user,
        );
        invoke(
            &game_transfer_instruction,
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.board.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn finalize_board(ctx: Context<FinalizeBoard>) -> Result<()> {
        let board = &mut ctx.accounts.board;

        require!(
            board.status == GameBoardStatus::Open,
            ErrorCode::NotAllSquaresPurchased
        );
        require!(
            board.squares.iter().all(|s| s.owner.is_some()),
            ErrorCode::NotAllSquaresPurchased
        );

        // Randomization logic
        let clock = Clock::get()?;
        board.home_team_indices = generate_random_indices(clock.slot);
        board.away_team_indices = generate_random_indices(clock.slot + 1);

        board.status = GameBoardStatus::Finalized;
        Ok(())
    }

    pub fn update_event_scores(
        ctx: Context<UpdateEventScores>,
        period: u8,
        home: u8,
        away: u8,
    ) -> Result<()> {
        require_keys_eq!(
            *ctx.accounts.admin.key,
            *ADMIN_PUBKEY,
            ErrorCode::Unauthorized
        );
        let scores = &mut ctx.accounts.scores;

        let score_update = Some((home, away));
        match period {
            1..=4 => scores.period_scores[period as usize - 1] = score_update,
            5 => scores.period_scores[4] = score_update, 
            _ => return Err(ErrorCode::InvalidPeriod.into()),
        }

        Ok(())
    }

    pub fn initialize_event_scores(
        ctx: Context<InitializeEventScores>,
        event_name: String,
        home_team_name: String,
        away_team_name: String,
    ) -> Result<()> {
        let scores = &mut ctx.accounts.scores;
        scores.event_name = event_name;
        scores.home_team_name = home_team_name;
        scores.away_team_name = away_team_name;
        scores.period_scores = [None; 5];
        Ok(())
    }

    pub fn calculate_game_board_winners(ctx: Context<CalculateGameBoardWinners>) -> Result<()> {
        let board = &mut ctx.accounts.board;
        let scores = &ctx.accounts.scores;

        if scores
            .period_scores
            .iter()
            .filter(|score| score.is_some())
            .count()
            > board
                .period_winners
                .iter()
                .filter(|winner| winner.is_some())
                .count()
        {
            update_period_winners(board, scores);
        }

        if board
            .period_winners
            .iter()
            .filter(|winner| winner.is_some())
            .count()
            == 5
        {
            board.status = GameBoardStatus::GameOver;
        }

        Ok(())
    }
}

#[account]
pub struct GameBoard {
    pub creator: Pubkey,
    pub cost_per_square: u64,
    pub status: GameBoardStatus,
    pub squares: Vec<GameBoardSquare>,
    pub home_team_indices: Vec<u8>,
    pub away_team_indices: Vec<u8>,
    pub scores_account: Pubkey,
    pub period_winners: [Option<Pubkey>; 5],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GameBoardSquare {
    pub owner: Option<Pubkey>,
    pub home_team_index: u8,
    pub away_team_index: u8,
}

#[account]
pub struct EventScores {
    pub admin: Pubkey,
    pub event_name: String,
    pub home_team_name: String,
    pub away_team_name: String,
    pub period_scores: [Option<(u8, u8)>; 5],
}

#[derive(Accounts)]
pub struct CreateGameBoard<'info> {
    #[account(init, payer = creator, space = 8 + 5000)]
    pub board: Account<'info, GameBoard>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseSquare<'info> {
    #[account(mut)]
    pub board: Account<'info, GameBoard>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeBoard<'info> {
    #[account(mut, has_one = creator)]
    pub board: Account<'info, GameBoard>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateEventScores<'info> {
    #[account(mut, has_one = admin)]
    pub scores: Account<'info, EventScores>,
    #[account(signer)]
    pub admin: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct InitializeEventScores<'info> {
    #[account(init, payer = admin, space = 8 + 1024)]
    pub scores: Account<'info, EventScores>,
    #[account(mut, signer)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CalculateGameBoardWinners<'info> {
    #[account(mut, has_one = creator)]
    pub board: Account<'info, GameBoard>,
    #[account(mut)]
    pub scores: Account<'info, EventScores>,
    #[account(mut)]
    pub creator: Signer<'info>,
}

#[derive(PartialEq, Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub enum GameBoardStatus {
    Open,
    Closed,
    Finalized,
    GameOver,
}

#[error_code]
pub enum ErrorCode {
    GameBoardClosed,
    InvalidSquareIndex,
    SquareAlreadyPurchased,
    Unauthorized,
    InvalidPeriod,
    GameBoardNotOpen,
    NotAllSquaresPurchased,
    GameBoardNotFinalized,
    PeriodAlreadyPaid,
}

const ADMIN_PUBKEY: &Pubkey = &pubkey!("3iGJM28vywNTUt5hZgHjri5LEzeRBevE75EbGY7wakJA");

fn generate_random_indices(seed: u64) -> Vec<u8> {
    let mut indices: Vec<u8> = (0..10).collect();
    let mut rng_seed = seed;
    for i in (1..indices.len()).rev() {
        rng_seed = xorshift64star(rng_seed);
        let j = (rng_seed % (i + 1) as u64) as usize;
        indices.swap(i, j);
    }
    indices
}

fn xorshift64star(mut x: u64) -> u64 {
    x ^= x << 12;
    x ^= x >> 25;
    x ^= x << 27;
    x.wrapping_mul(0x2545F4914F6CDD1D)
}

fn update_period_winners(board: &mut Account<GameBoard>, scores: &Account<EventScores>) {
    for (period_index, score_option) in scores.period_scores.iter().enumerate() {
        if let Some((home, away)) = score_option {
            let home_mod = home % 10;
            let away_mod = away % 10;

            for square in &board.squares {
                if square.home_team_index == home_mod && square.away_team_index == away_mod {
                    board.period_winners[period_index] = square.owner;
                    break;
                }
            }
        }
    }
}
