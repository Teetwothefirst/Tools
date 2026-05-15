I want to add a lightweight AI feature to my job cards. When a user pastes a raw text job description into the card's modal, I want an AI button that says 'Summarize & Key Skills'. Write a serverless function (or backend API route) that takes the job description text, sends it to an LLM API (like OpenAI or Gemini), and returns:

A 3-bullet-point summary of the role.

A list of the top 5 technical skills requested.
Return this as clean JSON and show me how to display it inside the Job Card modal.