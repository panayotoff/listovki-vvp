export interface Question {
    question_number: string;
    question: string;
    question_image?: string; // Optional image
    answer_a: string;
    answer_b: string;
    answer_c: string;
    answer_d: string;
    correct_answer: 'A' | 'B' | 'C' | 'D';
}

export interface SingleQuiz {
    title: string;
    questionsNumbers: (string | number)[];
}