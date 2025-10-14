import React, { useState, useEffect } from "react";
import allQuestions from "./data/questions.json";
import allSection from "./data/sections.json";
import themeTests from "./data/tests.json";
import type { Question, SingleQuiz, Section } from "./types";
import { shuffleArray } from "./utils/arrayUtils";
import { APP_BUILD_DATE } from "./version";

import DesktopQuiz from "./components/DesktopQuiz";
import SearchResultsList from "./components/SearchResultsList";
import Results from "./components/Results";

import "./index.css";

// Define the application modes
type AppMode = "search" | "quiz" | "results";
const QUIZ_LENGTH = 60;
const SINGLE_THEME_QUIZ_LENGTH = 20;
const NAVIGATION_STEP = 50;

function App() {
  const themeQuizes: SingleQuiz[] = [...themeTests] as SingleQuiz[];

  const [mode, setMode] = useState<AppMode>("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnswers, setShowAnswers] = useState(true);
  const toggleAnswers = () => setShowAnswers((prev) => !prev);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(
    allQuestions.map((q) => ({
      ...q,
      correct_answer: q.correct_answer as "A" | "B" | "C" | "D",
    }))
  );
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [displayQuestions, setDisplayQuestions] = useState<Section>({
    startQuestion: 1,
    endQuestion: allQuestions.length,
  });

  // const isMobile = false; // useMediaQuery("(max-width: 768px)");
  const navigationButtons = Array.from({ length: Math.ceil(allQuestions.length / NAVIGATION_STEP) }, (_, i) =>
    i === 0 ? 1 : i * NAVIGATION_STEP
  );
  navigationButtons.push(184, 329);
  navigationButtons.sort((a, b) => a - b);

  const handleScrollToQuestion = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = (e.currentTarget as HTMLAnchorElement).getAttribute("href");
    if (targetId) {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Effect for handling search filtering
  useEffect(() => {
    const results = allQuestions.filter(
      (question) =>
        (question.question_number.toString().includes(searchTerm) ||
          question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.answer_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.answer_b.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.answer_c.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.answer_d.toLowerCase().includes(searchTerm.toLowerCase())) &&
        parseInt(question.question_number) >= displayQuestions.startQuestion &&
        parseInt(question.question_number) <= displayQuestions.endQuestion
    );
    setFilteredQuestions(
      results.map((q) => ({
        ...q,
        correct_answer: q.correct_answer as "A" | "B" | "C" | "D",
      }))
    );
  }, [searchTerm, displayQuestions.startQuestion, displayQuestions.endQuestion]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (mode !== "search") {
      setMode("search");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.keyCode === 65 && mode && !(document.activeElement instanceof HTMLInputElement)) {
        toggleAnswers();
      }
    });
    if (window.location.hash?.length) {
      const questionNumber = window.location.hash.replace("#question-", "");
      const questionElement = document.getElementById(`question-${questionNumber}`);
      if (questionElement) {
        questionElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const startQuiz = (quizQuestions = allQuestions, quizLength = QUIZ_LENGTH) => {
    const randomQuestions = shuffleArray(quizQuestions).slice(0, quizLength);
    setQuizQuestions(
      randomQuestions.map((q) => ({
        ...q,
        correct_answer: q.correct_answer as "A" | "B" | "C" | "D",
      }))
    );
    setMode("quiz");
  };

  const handleQuizFinish = (score: number, _wrongAnswers: number[]) => {
    setWrongAnswers(_wrongAnswers);
    setFinalScore(score);
    setMode("results");
  };

  const handleRestart = () => {
    setSearchTerm(""); // Clear search
    setFilteredQuestions(
      allQuestions.map((q) => ({
        ...q,
        correct_answer: q.correct_answer as "A" | "B" | "C" | "D",
      }))
    );
    setMode("search");
  };

  const isSectionSelected = (section: Section) => {
    return (
      displayQuestions.startQuestion === section.startQuestion && displayQuestions.endQuestion === section.endQuestion
    );
  };

  const handleOnSectionClick = (section: Section) => {
    if (isSectionSelected(section)) {
      setDisplayQuestions({ startQuestion: 1, endQuestion: allQuestions.length });
      return;
    }
    setDisplayQuestions({ startQuestion: section.startQuestion, endQuestion: section.endQuestion });
  };

  const getSectionQuestions = (section: Section) => {
    return allQuestions.filter(
      (q) =>
        parseInt(q.question_number) >= section.startQuestion && parseInt(q.question_number) <= section.endQuestion
    );
  }

  const renderContent = () => {
    switch (mode) {
      case "quiz":
        return <DesktopQuiz questions={quizQuestions} onFinish={handleQuizFinish} />;
      case "results":
        return (
          <Results
            score={finalScore}
            totalQuestions={quizQuestions.length}
            onRestart={handleRestart}
            wrongAnswers={wrongAnswers}
            onRepeatWrong={() =>
              startQuiz(quizQuestions.filter((question) => wrongAnswers.includes(parseInt(question.question_number))))
            }
          />
        );
      case "search":
      default:
        return (
          <>
            <div className="start-quiz-container">
              {allSection.map((section, index) => (
                <button
                  key={index}
                  className={`button-primary button-section start-button ${
                    isSectionSelected(section) ? "button-section-selected" : ""
                  }`}
                  onClick={() => handleOnSectionClick(section)}
                >
                  <span>{section.title}</span>
                </button>
              ))}
              <button
                title={`Примерен тест от ${QUIZ_LENGTH} случайни въпроса`}
                onClick={() => startQuiz()}
                className="button-primary button-green start-button"
              >
                <span>{`Тест ${QUIZ_LENGTH} въпроса`}</span>
              </button>
              <button
                title={`Примерен тест от ${SINGLE_THEME_QUIZ_LENGTH} случайни въпроса`}
                onClick={() => startQuiz(undefined, SINGLE_THEME_QUIZ_LENGTH)}
                className="button-primary button-green start-button"
              >
                <span>{`Тест ${SINGLE_THEME_QUIZ_LENGTH} въпроса`}</span>
              </button>
              {themeQuizes.map((quiz: SingleQuiz, index: number) => (
                <div key={index} className="button-split">
                  <button
                    title={`Тест по тема: ${quiz.title} ( ${quiz.questionsNumbers.length} въпроса )`}
                    className="button-primary start-button"
                    onClick={() =>
                      startQuiz(
                        quiz.questionsNumbers.map(
                          (num) => allQuestions.find((q) => q.question_number === num.toString()) || allQuestions[0]
                        ),
                        quiz.questionsNumbers.length
                      )
                    }
                  >
                    <span className="button-label-title">{quiz.title}</span>
                    <span className="button-label-count">({quiz.questionsNumbers.length})</span>
                  </button>
                </div>
              ))}
              {allSection.map((section, index) => (
                <button
                  key={index}
                  className="button-primary start-button"
                  onClick={() => startQuiz(getSectionQuestions(section), getSectionQuestions(section).length)}
                >
                  <span className="button-label-title">{section.title}</span>
                  <span className="button-label-count">({getSectionQuestions(section).length})</span>
                </button>
              ))}
            </div>

            <div className="toggle-answers-container">
              <button
                onClick={toggleAnswers}
                className="button-secondary toggle-answers-button"
                title={showAnswers ? "Скрий отговорите" : "Покажи отговорите"}
              >
                {showAnswers ? (
                  <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g fill="currentcolor" fillRule="nonzero">
                      <path d="M23.725 12.05c-.625-.825-2.15-2.55-4.45-3.95L17.65 9.725c1.6.875 2.8 1.975 3.575 2.8-1.175 1.25-3.325 3.125-6.375 3.9a4.817 4.817 0 0 0 1.975-3.9c0-.6-.1-1.175-.3-1.7L8.75 18.6c1 .25 2.1.375 3.25.375 6.55 0 10.55-4.5 11.725-6 .2-.25.2-.65 0-.925ZM21.375 2.325c-.425-.425-1.125-.425-1.575 0L15.575 6.55c-1.1-.3-2.3-.475-3.6-.475-6.55 0-10.55 4.5-11.725 6a.753.753 0 0 0 0 .95c.65.85 2.25 2.7 4.725 4.1l-3.5 3.5c-.425.425-.425 1.125 0 1.575.225.225.5.325.775.325s.575-.1.775-.325l18.3-18.3c.5-.45.5-1.15.05-1.575ZM2.8 12.525c1.175-1.25 3.325-3.125 6.375-3.9a4.817 4.817 0 0 0-1.975 3.9c0 .7.15 1.375.425 2l-.95.95a13.758 13.758 0 0 1-3.875-2.95Z" />
                    </g>
                  </svg>
                ) : (
                  <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g fill="currentcolor" fillRule="nonzero">
                      <path d="M23.725 12.025c-1.15-1.5-5.175-6-11.725-6s-10.55 4.5-11.725 6a.753.753 0 0 0 0 .95c1.15 1.5 5.175 6 11.725 6s10.55-4.5 11.725-6c.2-.275.2-.675 0-.95ZM12 17.325A4.812 4.812 0 0 1 7.175 12.5 4.812 4.812 0 0 1 12 7.675a4.812 4.812 0 0 1 4.825 4.825A4.812 4.812 0 0 1 12 17.325Z" />
                      <path d="M12 9.4c-.275 0-.525.025-.775.1.375.3.6.725.6 1.25 0 .875-.7 1.575-1.575 1.575-.5 0-.95-.225-1.25-.6-.075.25-.1.525-.1.775a3.1 3.1 0 0 0 3.1 3.1c1.7 0 3.1-1.4 3.1-3.1 0-1.7-1.4-3.1-3.1-3.1Z" />
                    </g>
                  </svg>
                )}
              </button>
            </div>
            <SearchResultsList showAnswers={showAnswers} questions={filteredQuestions} />
          </>
        );
    }
  };

  return (
    <div className="App">
      {mode === "quiz" && (
        <div className="quiz-header">
          <button
            className="button-secondary back-button"
            title="Назад към въпросите"
            onClick={() => {
              setMode("search");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 108.06" width={"1rem"} height={"1rem"}>
              <path d="M63.94,24.28a14.28,14.28,0,0,0-20.36-20L4.1,44.42a14.27,14.27,0,0,0,0,20l38.69,39.35a14.27,14.27,0,0,0,20.35-20L48.06,68.41l60.66-.29a14.27,14.27,0,1,0-.23-28.54l-59.85.28,15.3-15.58Z" />
            </svg>
            <span>Назад</span>
          </button>
        </div>
      )}
      {mode === "search" && (
        <header className="app-header">
          <h1>Листовки ВВП</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Търси въпроси..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <div className="quiz-navigation">
            {navigationButtons.map((questionIndex) => (
              <a
                className={questionIndex % NAVIGATION_STEP === 0 ? "" : "nav-button-section"}
                key={questionIndex}
                href={`#question-${questionIndex}`}
                title={`Отиди на въпрос ${questionIndex}`}
                onClick={handleScrollToQuestion}
              >
                {questionIndex}
              </a>
            ))}
          </div>
        </header>
      )}
      <main>{renderContent()}</main>
      {mode === "search" && (
        <footer>
          <p>
            © {new Date().getFullYear()} Христо Панайотов, за лична употреба. Build {APP_BUILD_DATE}.{" "}
            <a href="https://github.com/panayotoff/listovki-40bt">
              GitHub
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="Interface / External_Link">
                  <path
                    d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;
