// components/games/data.ts
import { Rocket, Gem, Target, Coins, Sparkles } from 'lucide-react'; // Gem, Target, Coins, Sparkles - возможно другие иконки если хотите
import { Game } from './types';

// Убедитесь, что имена и описания на английском
export const games: Game[] = [
  {
    id: 'luckyjet',
    name: 'Lucky Jet',
    icon: Rocket, // или другая иконка, если Rocket не подходит
    description: "Fly high, win big!",
  },
  {
    id: 'rocketqueen',
    name: 'Rocket Queen',
    icon: Sparkles, // или другая
    description: "Reach for the stars!",
  },
  {
    id: 'mines',
    name: 'Mines',
    icon: Gem, // или другая
    description: "Uncover gems, avoid mines!",
  },
  {
    id: 'penalty',
    name: 'Penalty',
    icon: Target, // или другая
    description: "Score the winning goal!",
  },
  {
    id: 'coinflip',
    name: 'Coinflip',
    icon: Coins, // или другая
    description: "Heads or tails?",
  },
];
