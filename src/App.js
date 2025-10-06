import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Emoji pool
const allItems = [
  "🐶","🐱","⭐","🌈","😊","💙","🍎","🚀","🍩","⚽","🎵","🌻",
  "🐼","🍔","🎮","🎲","🦄","🍓","🎁","🔥","🌙","🍕","🛸","🎨",
  "🦊","🐸","🐢","🦋","🍉","🎤","🍿","🧩","🏀","🎧","🍪","⚡",
  "🐨","🦁","🐯","🐷","🐵","🐻","🐔","🐧","🐙","🐠","🦖","🦕"
];

// Levels
const levels = [
  { id: "easy", label: "🐣 Easy", pairs: 3, time: 30 },
  { id: "medium", label: "⚡ Medium", pairs: 6, time: 60 },
  { id: "hard", label: "🔥 Hard", pairs: 10, time: 100 },
  { id: "veryhard", label: "💀 Very Hard", pairs: 12, time: 120 },
  { id: "extreme", label: "👑 Extreme", pairs: 14, time: 150 }
];

function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [interacted, setInteracted] = useState(false);

  // Sounds
  const flipSound = useRef(new Audio(process.env.PUBLIC_URL + "/sounds/flip.mp3"));
  const matchSound = useRef(new Audio(process.env.PUBLIC_URL + "/sounds/match.mp3"));
  const winSound = useRef(new Audio(process.env.PUBLIC_URL + "/sounds/win.mp3"));
  const loseSound = useRef(new Audio(process.env.PUBLIC_URL + "/sounds/lose.mp3"));

  useEffect(() => {
    [flipSound, matchSound, winSound, loseSound].forEach(s => s.current.load());
  }, []);

  const startGame = (index) => {
    const { pairs, time } = levels[index];
    const chosenItems = allItems.slice(0, pairs);
    const shuffled = [...chosenItems, ...chosenItems]
      .sort(() => Math.random() - 0.5)
      .map((item, i) => ({ id: i, item }));

    setLevelIndex(index);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setGameOver(false);
    setWin(false);
    setTimeLeft(time);
  };

  useEffect(() => startGame(0), []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver && interacted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver && cards.length > 0) {
      setGameOver(true);
      setWin(false);
      playSound(loseSound);
    }
  }, [timeLeft, gameOver, cards, interacted]);

  const playSound = (soundRef) => {
    if (interacted) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(() => {});
    }
  };

  const handleFlip = (id) => {
    if (!interacted) setInteracted(true); // mark first click
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    setFlipped([...flipped, id]);
    playSound(flipSound);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].item === cards[second].item) {
        setMatched(prev => [...prev, first, second]);
        playSound(matchSound);
      }
      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameOver(true);
      setWin(true);
      playSound(winSound);
    }
  }, [matched, cards]);

  const goNextLevel = () => {
    if (levelIndex + 1 < levels.length) startGame(levelIndex + 1);
    else setWin("completed");
  };

  const restartGame = () => startGame(0);

  return (
    <div className="app">
      {!interacted && (
        <div className="overlay" onClick={() => setInteracted(true)}>
          <h2>Click/Tap to Start the Game</h2>
        </div>
      )}

      <h1>🧠 Memory Match</h1>
      <h2>{levels[levelIndex].label}</h2>

      {!gameOver && (
        <>
          <p className="timer">⏳ Time Left: {timeLeft}s</p>
          <div className={`grid grid-${levels[levelIndex].id}`}>
            {cards.map((card, i) => {
              const isFlipped = flipped.includes(i) || matched.includes(i);
              return (
                <div
                  key={card.id}
                  className={`card ${isFlipped ? "flipped" : ""}`}
                  onClick={() => handleFlip(i)}
                >
                  {isFlipped ? card.item : "❓"}
                </div>
              );
            })}
          </div>
        </>
      )}

      {gameOver && (
        <div className="game-over">
          {win === true ? (
            <>
              <h2 className="success">🎉 You Won {levels[levelIndex].label}! 🎉</h2>
              {levelIndex + 1 < levels.length && (
                <button className="next-btn" onClick={goNextLevel}>👉 Next Level</button>
              )}
            </>
          ) : win === "completed" ? (
            <h2 className="success">🏆 You Finished All Levels! 🏆</h2>
          ) : (
            <>
              <h2 className="fail">⏰ Time’s Up! You Lost!</h2>
              <button className="next-btn" onClick={() => startGame(levelIndex)}>
                🔁 Retry {levels[levelIndex].label}
              </button>
            </>
          )}
          <button className="restart-btn" onClick={restartGame}>🔄 Restart from Easy</button>
        </div>
      )}
    </div>
  );
}

export default App;
