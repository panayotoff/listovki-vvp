import React from "react";
import Confetti from "react-confetti";

interface ResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onRepeatWrong?: (wrongAnswers?: number[]) => void;
  wrongAnswers?: number[];
}

const Results: React.FC<ResultsProps> = ({ score, totalQuestions, onRestart, wrongAnswers, onRepeatWrong }) => {
  return (
    <div className="results-container">
      <h2>Готово!</h2>
      <p>
        Точки: {score} / {totalQuestions}
      </p>
      <button onClick={onRestart} className="button-primary">
        <span>Започни отначало</span>
      </button>
      {wrongAnswers && wrongAnswers.length > 0 && (
        <>
          <br />
          <br />
          <br />
          <button className="button-primary" onClick={() => onRepeatWrong && onRepeatWrong(wrongAnswers)}>
            <span>Повтори сбърканите въпроси</span>
          </button>
        </>
      )}
      {score === totalQuestions && <Confetti width={window.innerWidth} height={window.innerHeight} />}
    </div>
  );
};

export default Results;
