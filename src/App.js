import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const items = ["🐶", "🐱", "⭐", "🌈", "😊", "💙"]; // icons to match

function App() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // Sound effects
  const flipSound = useRef(new Audio(process.env.PUBLIC_URL + "/sounds/flip.mp3"));
  const matchSound = useRef(new Audio(process.env.PUBLIC_URL + "/sounds/match.mp3"));
  const winSound = useRef(new Audio(process.env.PUBLIC_URL + "/sounds/win.mp3"));

  // Preload sounds
  useEffect(() => {
    flipSound.current.load();
    matchSound.current.load();
    winSound.current.load();
  }, []);

  // Shuffle and initialize cards on mount
  useEffect(() => {
    const shuffled = [...items, ...items]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ id: index, item }));
    setCards(shuffled);
  }, []);

  const handleFlip = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    setFlipped([...flipped, id]);
    
    // Play flip sound instantly
    flipSound.current.currentTime = 0;
    flipSound.current.play();
  };

  // Check for matches
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].item === cards[second].item) {
        setMatched(prev => [...prev, first, second]); // store indices
        matchSound.current.currentTime = 0;
        matchSound.current.play();
      }
      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped, cards]);

  // Check for game over
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameOver(true);
      winSound.current.currentTime = 0;
      winSound.current.play();
    }
  }, [matched, cards]);

  // Restart game
  const handleRestart = () => {
    const shuffled = [...items, ...items]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ id: index, item }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setGameOver(false);
  };

  return (
    <div className="app">
      <h1>🧠 Memory Match</h1>
      <p>Find all the pairs!</p>
      <div className="grid">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <div
              key={card.id}
              className={`card ${isFlipped ? "flipped" : ""}`}
              onClick={() => handleFlip(index)}
            >
              {isFlipped ? card.item : "❓"}
            </div>
          );
        })}
      </div>

      {gameOver && (
        <div className="game-over">
          <h2 className="success">🎉 Congratulations! You matched them all! 🎉</h2>
          <button className="restart-btn" onClick={handleRestart}>
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
