import React from 'react';
import type { Question } from '../types';

interface SearchResultsListProps {
  questions: Question[];
  showAnswers?: boolean;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ questions, showAnswers }) => {
  if (questions.length === 0) {
    return <p>Няма нищо намерено!</p>;
  }

  return (
    <div className="search-results-container">
      {questions.map((q) => (
        <div id={`question-${q.question_number}`} key={q.question_number} className="search-result-card">
          <h4><a href={`#question-${q.question_number}`}>{q.question_number}. {q.question}</a></h4>
          {q.question_image && (
             <img src={`./question_images/${q.question_image}`} alt="Illustration" className="question-image-small" />
          )}
          <ul>
            <li className={q.correct_answer === 'A' && showAnswers ? 'highlight-answer' : ''}>A: {q.answer_a}</li>
            <li className={q.correct_answer === 'B' && showAnswers ? 'highlight-answer' : ''}>B: {q.answer_b}</li>
            <li className={q.correct_answer === 'C' && showAnswers ? 'highlight-answer' : ''}>C: {q.answer_c}</li>
            <li className={q.correct_answer === 'D' && showAnswers ? 'highlight-answer' : ''}>D: {q.answer_d}</li>
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SearchResultsList;