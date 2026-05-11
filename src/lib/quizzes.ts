import type { Quiz } from "@/components/QuizModal";

export const QUIZZES: Quiz[] = [
  {
    id: "js", title: "JavaScript Mastery",
    questions: [
      { q: "What is the output of typeof null?", choices: ["null", "object", "undefined", "boolean"], answer: 1 },
      { q: "Which keyword creates a block-scoped variable?", choices: ["var", "let", "global", "func"], answer: 1 },
      { q: "What does '===' check?", choices: ["Value only", "Type only", "Value and type", "Reference only"], answer: 2 },
      { q: "Promise.all rejects when…", choices: ["All reject", "Any rejects", "First resolves", "Never"], answer: 1 },
      { q: "Array method that mutates?", choices: ["map", "filter", "splice", "slice"], answer: 2 },
    ],
  },
  {
    id: "algo", title: "Algorithms",
    questions: [
      { q: "Big-O of binary search?", choices: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: 1 },
      { q: "Best avg-case sort?", choices: ["Bubble", "Insertion", "Quicksort", "Selection"], answer: 2 },
      { q: "BFS uses what data structure?", choices: ["Stack", "Queue", "Heap", "Tree"], answer: 1 },
      { q: "DP requires…", choices: ["Greedy choice", "Overlapping subproblems", "Sorting", "Recursion only"], answer: 1 },
    ],
  },
  {
    id: "react", title: "React Internals",
    questions: [
      { q: "Hook for side effects?", choices: ["useState", "useEffect", "useRef", "useMemo"], answer: 1 },
      { q: "Reconciliation compares…", choices: ["DOM trees", "Virtual DOM", "Real DOM", "Props only"], answer: 1 },
      { q: "Keys are required for…", choices: ["Forms", "Lists", "Effects", "Contexts"], answer: 1 },
    ],
  },
  {
    id: "css", title: "CSS Wizardry",
    questions: [
      { q: "Centering with flex?", choices: ["align-content", "justify-items", "place-items", "align+justify"], answer: 3 },
      { q: "rem is relative to…", choices: ["parent", "root", "viewport", "self"], answer: 1 },
      { q: "z-index needs…", choices: ["display block", "position non-static", "float", "opacity"], answer: 1 },
    ],
  },
];
