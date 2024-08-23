# squares.gg

This is a Next.js app with an Solana backend (using the Anchor framework) to store game state and handle
payments. I used it to learn the Solana account-based programming model. It never had a code review, so
I'm sure there are things that could be improved.

I started working on this the day after the NFC/AFC championship games and it was ready for the Super Bowl,
despite only having the time after work and the time on weekends and despite not having worked with the
Solana programming model or Next.js, for that matter.

That's why it says "schizobuilt by @rhiza" at the bottom. I was just working as fast as I could to get it
done by the Super Bowl, with no regard for code quality, which I'm usually very adamant about.

That said, the app worked fine during the Super Bowl, people won money (ask [@brokenmechanic on twitter](https://twitter.com/MechanicBroken))
and got their payouts.

# how it works

The game board is a 10x10 grid that represents all possible scores of an NFL game.

You set a price for the cost of each square, let's say 1 SOL per square for simplicity. This means once the
board is filled, there is 100 SOL in the pot.

At the end of each quarter, there is a payout for the player who owns the square that represents the score.
(By default, there's also a 5th payout for the final score, to allow for score changes in the event the game goes into overtime.)

You and your friends buy as many squares as you're comfortable wagering, usually 3 to 10 squares per person.

You have 5 chances to win 1/5th of the pot during the game. 5 chances to win 20 SOL, while usually wagering between
3 and 10 SOL.

<img width="1138" alt="image" src="https://github.com/user-attachments/assets/1cb0cac1-dbcf-4901-a348-8e893807fec6">

In this game, this fucker `8eTK..kHEd` bought 3 squares and won 2 out of the 5 payouts.

Even though the score changed from 3-10 to 13-10, that's the same square (3, 0), which you can see that he owned.


# wat? (FAQ)

Q: how do 100 squares represent all scores in a football game?<br>
A: the scores are modulus 10, basically meaning you chop off all the numbers but the last one. `14 % 10 == 4`

Q: wouldn't the squares with the most common scores like 14 and 7 be more valuable than the others, so it'd be unfair?<br>
A: yeah, those squares _are_ more valuable than 2 or 9. but the cells aren't numbered by their position in the grid. before
the game starts, there are x and y header rows whose values are randomized once the board's filled in. every square before 
randomization has (approx?) the same probability of winning.

<img width="400" alt="image" src="https://github.com/user-attachments/assets/dc4f7ef6-97a1-4e6d-8ac8-7835f7d1ffc3"> <img width="393" alt="image" src="https://github.com/user-attachments/assets/3b9b389c-4103-4160-8cb4-a020bca2b485">

# contact

[@rhizanthemum on twitter](https://x.com/rhizanthemum/)
[@rhiza on warpcast](https://warpcast.com/rhiza)
[chunky metro discord](https://discord.gg/invite/3gpAQDuAwy)
