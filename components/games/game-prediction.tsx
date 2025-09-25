'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { games } from '@/components/games/data';
import { Game } from '@/components/games/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  RefreshCw,
  Loader2,
  Gamepad2,
  ShieldCheck,
  Bomb,
  Coins as CoinflipIcon,
  Crosshair as PenaltyIcon
} from 'lucide-react';

interface GamePredictionSectionProps {
  onGeneratePrediction: (gameName: string, predictionValue: string) => void;
}

const MINES_GRID_SIZE = 5;
const DEFAULT_NUM_MINES = 3;
const MINES_PREDICT_COUNT = 3;

const PENALTY_SPOTS = [
  "Top Left", "Top Center", "Top Right",
  "Middle Left", "Center", "Middle Right",
  "Bottom Left", "Bottom Center", "Bottom Right"
];

type MinesCell = { row: number; col: number; isSafe: boolean };
type PredictionResult = string | MinesCell[] | null;
type MinesGridCell = { row: number; col: number; isBomb: boolean; isPredictedSafe: boolean };

export function GamePredictionSection({ onGeneratePrediction }: GamePredictionSectionProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult>(null);
  const [shufflingPrediction, setShufflingPrediction] = useState<string | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const shuffleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [minesDisplayGrid, setMinesDisplayGrid] = useState<MinesGridCell[]>([]);
  const [predictedSafeCellsForDisplay, setPredictedSafeCellsForDisplay] = useState<MinesCell[]>([]);

  // --- НАЧАЛО ИЗМЕНЕНИЯ ---
  // Этот хук будет выполняться один раз, когда компонент загружается.
  // Он прокручивает страницу в самый верх.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // --- КОНЕЦ ИЗМЕНЕНИЯ ---

  useEffect(() => {
    return () => {
      if (shuffleTimeoutRef.current) {
        clearTimeout(shuffleTimeoutRef.current);
      }
    };
  }, []);

  const getLoadingText = (gameId: string | undefined): string => {
    switch (gameId) {
      case 'mines': return `Analyzing minefield (${DEFAULT_NUM_MINES} mines)...`;
      case 'coinflip': return "Flipping the coin...";
      case 'penalty': return "Choosing the target...";
      default: return "Calculating coefficient...";
    }
  };

  const generateNewPrediction = useCallback((game: Game) => {
    if (isLoadingPrediction) return;

    setIsLoadingPrediction(true);
    setPrediction(null);
    setShufflingPrediction(null);
    setMinesDisplayGrid([]);
    setPredictedSafeCellsForDisplay([]);

    if (shuffleTimeoutRef.current) {
      clearTimeout(shuffleTimeoutRef.current);
    }

    const mainTimeoutDuration = 1000;

    setTimeout(() => {
      let result: PredictionResult = null;
      let onGeneratePredictionValue = "";

      switch (game.id) {
        case 'luckyjet':
        case 'rocketqueen':
          const coeff = (Math.random() * (15.0 - 1.01) + 1.01).toFixed(2);
          result = `${coeff}x`;
          onGeneratePredictionValue = result;
          break;
        case 'mines':
          const gridSize = MINES_GRID_SIZE;
          const currentNumMines = DEFAULT_NUM_MINES;
          const bombLocations: Array<{ row: number, col: number }> = [];
          while (bombLocations.length < currentNumMines) {
            const r = Math.floor(Math.random() * gridSize);
            const c = Math.floor(Math.random() * gridSize);
            if (!bombLocations.some(loc => loc.row === r && loc.col === c)) {
              bombLocations.push({ row: r, col: c });
            }
          }

          const currentPredictedSafeCells: MinesCell[] = [];
          let attempts = 0;
          const maxAttempts = gridSize * gridSize * 2;

          while (currentPredictedSafeCells.length < MINES_PREDICT_COUNT &&
            currentPredictedSafeCells.length < (gridSize * gridSize - currentNumMines) &&
            attempts < maxAttempts) {
            const r = Math.floor(Math.random() * gridSize);
            const c = Math.floor(Math.random() * gridSize);
            if (!bombLocations.some(loc => loc.row === r && loc.col === c) &&
              !currentPredictedSafeCells.some(loc => loc.row === r && loc.col === c)) {
              currentPredictedSafeCells.push({ row: r, col: c, isSafe: true });
            }
            attempts++;
          }

          const newMinesGrid: MinesGridCell[] = [];
          for (let r_idx = 0; r_idx < gridSize; r_idx++) {
            for (let c_idx = 0; c_idx < gridSize; c_idx++) {
              newMinesGrid.push({
                row: r_idx,
                col: c_idx,
                isBomb: bombLocations.some(loc => loc.row === r_idx && loc.col === c_idx),
                isPredictedSafe: currentPredictedSafeCells.some(safeCell => safeCell.row === r_idx && safeCell.col === c_idx)
              });
            }
          }
          setMinesDisplayGrid(newMinesGrid);
          setPredictedSafeCellsForDisplay(currentPredictedSafeCells);
          result = currentPredictedSafeCells;
          onGeneratePredictionValue = `Predicted ${currentPredictedSafeCells.length} safe spots for ${currentNumMines} mines.`;
          break;
        case 'coinflip':
          result = Math.random() < 0.5 ? "Heads" : "Tails";
          onGeneratePredictionValue = `Prediction: ${result}`;
          break;
        case 'penalty':
          result = PENALTY_SPOTS[Math.floor(Math.random() * PENALTY_SPOTS.length)];
          onGeneratePredictionValue = `Predicted shot: ${result}`;
          break;
        default:
          result = "N/A";
          onGeneratePredictionValue = "Prediction: N/A";
      }

      setPrediction(result);
      if (game.id !== 'luckyjet' && game.id !== 'rocketqueen') {
        setShufflingPrediction(null);
      }
      
      // onGeneratePrediction(game.name, onGeneratePredictionValue);
      
      setIsLoadingPrediction(false);
    }, mainTimeoutDuration);

    if (game.id === 'luckyjet' || game.id === 'rocketqueen') {
      const shuffleInterval = 60;
      const totalShuffleDuration = Math.max(0, mainTimeoutDuration - 200);
      let elapsedShuffleTime = 0;

      const shuffleEffect = () => {
        if (!isLoadingPrediction || elapsedShuffleTime >= totalShuffleDuration || selectedGame?.id !== game.id) {
          if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
          if (isLoadingPrediction && elapsedShuffleTime >= totalShuffleDuration && !prediction && selectedGame?.id === game.id) {
            setShufflingPrediction(null);
          }
          return;
        }
        setShufflingPrediction((Math.random() * (15.0 - 1.01) + 1.01).toFixed(2) + "x");
        elapsedShuffleTime += shuffleInterval;
        shuffleTimeoutRef.current = setTimeout(shuffleEffect, shuffleInterval);
      };
      if (selectedGame?.id === game.id) {
        shuffleTimeoutRef.current = setTimeout(shuffleEffect, 0);
      }
    }
  }, [isLoadingPrediction, selectedGame?.id, prediction]);

  const handleGameSelect = (game: Game) => {
    if (isLoadingPrediction && selectedGame?.id === game.id) return;

    setPrediction(null);
    setMinesDisplayGrid([]);
    setPredictedSafeCellsForDisplay([]);
    setSelectedGame(game);
    generateNewPrediction(game);
  };

  const renderPredictionContent = () => {
    if (!selectedGame || prediction === null) return null;

    switch (selectedGame.id) {
      case 'mines':
        if (!Array.isArray(prediction) || minesDisplayGrid.length === 0) {
          return <p className="text-sm text-muted-foreground">Generating Mines prediction...</p>;
        }
        return (
          <div className="flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-2">
              Predicted {predictedSafeCellsForDisplay.length} safe cells ({DEFAULT_NUM_MINES} mines):
            </p>
            <div
              className={cn("grid gap-1 p-1 rounded-md bg-blue-500/10 dark:bg-blue-700/20 border border-blue-600/30 dark:border-blue-500/40")}
              style={{ gridTemplateColumns: `repeat(${MINES_GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {minesDisplayGrid.map((cell, index) => (
                <div
                  key={`${cell.row}-${cell.col}-${index}`}
                  className={cn(
                    `aspect-square border rounded-md flex items-center justify-center transition-all duration-200 ease-in-out text-xs sm:text-sm font-medium`,
                    cell.isBomb
                      ? 'bg-red-500/20 dark:bg-red-700/30 border-red-600/70 dark:border-red-600/70'
                      : cell.isPredictedSafe
                        ? 'bg-green-500/20 dark:bg-green-600/30 border-green-600/70 dark:border-green-500/70 ring-2 ring-green-600/60 dark:ring-green-500/60 shadow-md scale-105 z-10'
                        : 'bg-background/50 dark:bg-card/50 border-border/40 dark:border-border/30',
                  )}
                >
                  {cell.isBomb && <Bomb className="w-3/5 h-3/5 text-red-700 dark:text-red-500" />}
                  {cell.isPredictedSafe && !cell.isBomb && <ShieldCheck className="w-3/5 h-3/5 text-green-700 dark:text-green-500" />}
                </div>
              ))}
            </div>
          </div>
        );
      case 'coinflip':
        return (
          <div className="flex flex-col items-center space-y-1.5">
            <CoinflipIcon className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
            <p className="text-3xl sm:text-4xl font-bold text-primary">{prediction as string}</p>
          </div>
        );
      case 'penalty':
        return (
          <div className="flex flex-col items-center space-y-1.5">
            <PenaltyIcon className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
            <p className="text-sm text-muted-foreground">Predicted Shot:</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{prediction as string}</p>

          </div>
        );
      default:
        return (
          <>
            <p className="text-4xl sm:text-5xl font-bold text-primary my-2 tabular-nums">{prediction as string}</p>
            <p className="text-xs text-muted-foreground">Generated coefficient.</p>
          </>
        );
    }
  };

  return (
    <section className="w-full flex flex-col h-full max-w-4xl mx-auto">
      <div className="space-y-3 pt-1 flex-grow flex flex-col overflow-y-auto p-1">
        <p className="text-xs sm:text-sm text-muted-foreground px-1 text-center">
          Select a game.
        </p>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-2">
          {games.map((game) => {
            const IconComponent = game.icon;
            const isCurrentlySelected = selectedGame?.id === game.id;
            return (
              <Card
                key={game.id}
                className={cn(
                  'cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50 border-2 border-transparent flex flex-col items-center justify-center p-1.5 text-center min-h-[70px] group transform hover:-translate-y-px',
                  'bg-card hover:bg-muted/30',
                  isCurrentlySelected && !prediction && !isLoadingPrediction && 'ring-1 ring-primary/40 border-primary/20',
                  isCurrentlySelected && prediction && !isLoadingPrediction && 'ring-1 ring-primary shadow-lg border-primary/50',
                  isLoadingPrediction && isCurrentlySelected && 'opacity-70 cursor-wait ring-1 ring-amber-500 border-amber-500',
                  isLoadingPrediction && !isCurrentlySelected && 'opacity-60 cursor-not-allowed'
                )}
                onClick={() => handleGameSelect(game)}
                aria-disabled={isLoadingPrediction && selectedGame?.id === game.id}
              >
                <IconComponent className={cn("size-4 sm:size-5 mb-1 transition-colors", (isCurrentlySelected && !isLoadingPrediction) ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                <CardTitle className="text-[11px] sm:text-xs font-medium leading-tight group-hover:text-primary transition-colors">
                  {game.name}
                </CardTitle>
              </Card>
            );
          })}
        </div>

        <div className="flex-grow flex items-center justify-center mt-2 md:mt-3 px-1">
          {isLoadingPrediction && selectedGame && (
            <Card className="w-full max-w-[280px] sm:max-w-xs mx-auto bg-card shadow-md animate-in fade-in-0 zoom-in-95">
              <CardHeader className="p-2 sm:p-3">
                <CardTitle className="text-center text-sm sm:text-base">
                  Generating for <span className="text-primary">{selectedGame.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-4 sm:py-5 min-h-[100px] sm:min-h-[120px] flex flex-col justify-center items-center">
                {(selectedGame.id === 'luckyjet' || selectedGame.id === 'rocketqueen') && shufflingPrediction ? (
                  <p className="text-3xl sm:text-4xl font-bold text-primary my-1 tabular-nums">
                    {shufflingPrediction}
                  </p>
                ) : (
                  <Loader2 className="w-6 h-6 sm:w-7 sm:w-7 text-primary animate-spin mx-auto my-0.5" />
                )}
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                  {getLoadingText(selectedGame.id)}
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoadingPrediction && selectedGame && prediction !== null && (
            <Card className="w-full max-w-[280px] sm:max-w-xs mx-auto bg-card shadow-md animate-in fade-in-0 zoom-in-95">
              <CardHeader className="p-2 sm:p-3">
                <CardTitle className="text-center text-sm sm:text-base">
                  Prediction for <span className="text-primary">{selectedGame.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-3 sm:py-4 min-h-[100px] sm:min-h-[120px] flex flex-col justify-center">
                {renderPredictionContent()}
              </CardContent>
              <CardFooter className="justify-center pt-1.5 sm:pt-2 p-2 sm:p-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 hover:text-primary active:scale-95 transform text-xs"
                  onClick={() => generateNewPrediction(selectedGame)}
                  disabled={isLoadingPrediction}
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${isLoadingPrediction && prediction === null ? 'animate-spin' : ''}`} />
                  Generate New
                </Button>
              </CardFooter>
            </Card>
          )}

          {!selectedGame && !isLoadingPrediction && (
            <div className="text-center py-6 border-2 border-dashed border-border/20 rounded-lg animate-in fade-in-0 w-full max-w-[280px] sm:max-w-xs mx-auto bg-muted/20">
              <Gamepad2 className="h-8 w-8 sm:h-9 sm:h-9 mx-auto mb-1.5 text-muted-foreground/40" />
              <p className="text-sm sm:text-base text-muted-foreground">
                Select a game to view its prediction.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
