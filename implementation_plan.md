# Gamification Implementation Plan

This plan introduces gamification to the Maths Solver to increase user engagement through points, daily streaks, goals, and badges.

## Proposed Changes

### Component: Mock API (`mock-api.js`)
To securely "store" the user's gamification stats locally (simulating a real backend), we will intercept a new set of API routes:
- `GET /api/gamification`: Fetch the user's current points, streak, last valid streak date, and today's solve count.
- `POST /api/gamification/solve`: Endpoint hit after a successful math solve. It increments points, checks/updates the daily streak, increments `todaySolves`, and returns the updated state (and flags if they leveled up).

### Component: User Interface (`solver.html` & `style.css`)
- **Gamification Card**: Add a new module in the right-hand sidebar above the History panel. It will display:
  - Current Badge (Beginner, Intermediate, Master) with a stylized gradient icon.
  - Points total.
  - A subtle flame icon with the current day streak count.
  - A progress bar outlining the daily goal: "Solve 5 questions today".
- **Animations**: Add CSS keyframes for a celebratory pop when achieving the daily goal or leveling up a badge.
- **Guest Mode state**: Just like History, the gamification card will prompt the user to log in to track their progress if they are currently a guest.

### Component: Core Logic (`script.js`)
- Add state variables to `appState` to hold `gamification`.
- Call `POST /api/gamification/solve` at the end of the `handleSolve()` success branch.
- Update the UI to fill the progress bar, increase points, and dynamically recalculate the badge based on total points.
- Badge Tiers:
  - **Beginner**: 0 - 49 points
  - **Intermediate**: 50 - 199 points (5-19 solves)
  - **Master**: 200+ points (20+ solves)

## Open Questions

> [!IMPORTANT]
> How would you like the reward system balanced? Right now, I am using:
> - 10 points per successful solve.
> - "Beginner" badge by default. "Intermediate" unlocked at 50 points (5 solves). "Master" at 200 points (20 solves).
> Are these numbers okay or would you like a steeper progression?

## Verification Plan
1. **Manual Testing in browser**: 
   - Load application, log in.
   - Enter a valid probability problem and click solve.
   - Verify that Gamification points increment by 10, the daily progress bar moves from 0/5 to 1/5, and the streak shows "1".
   - Complete 5 solves and verify the progress bar turns green/shows completion.
   - Attain 50 points and verify the UI label changes to "Intermediate".
