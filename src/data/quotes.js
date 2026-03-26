// Real quotes categorized by length
const quotes = {
  short: [
    "The only way to do great work is to love what you do.",
    "In the middle of difficulty lies opportunity.",
    "Life is what happens when you are busy making other plans.",
    "The best time to plant a tree was twenty years ago. The second best time is now.",
    "Be yourself. Everyone else is already taken.",
    "Two things are infinite: the universe and human stupidity.",
    "So many books, so little time.",
    "A room without books is like a body without a soul.",
    "You only live once, but if you do it right, once is enough.",
    "If you tell the truth, you do not have to remember anything.",
    "The secret of getting ahead is getting started.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Believe you can and you are halfway there.",
    "Stay hungry, stay foolish.",
    "Simplicity is the ultimate sophistication.",
    "The best revenge is massive success.",
    "Dream big and dare to fail.",
    "What we think, we become.",
    "Act as if what you do makes a difference. It does.",
    "Well done is better than well said.",
  ],
  medium: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The only limit to our realization of tomorrow will be our doubts of today.",
    "It is during our darkest moments that we must focus to see the light. The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "The future belongs to those who believe in the beauty of their dreams. Go confidently in the direction of your dreams and live the life you have imagined.",
    "In three words I can sum up everything I have learned about life: it goes on. Not everything that is faced can be changed, but nothing can be changed until it is faced.",
    "The purpose of our lives is to be happy. You miss one hundred percent of the shots you never take. Life is really simple, but we insist on making it complicated.",
    "Do not go where the path may lead. Go instead where there is no path and leave a trail. The mind is everything. What you think you become.",
    "Spread love everywhere you go. Let no one ever come to you without leaving happier. If you look at what you have in life, you will always have more.",
    "The only impossible journey is the one you never begin. Keep your face always toward the sunshine and shadows will fall behind you.",
    "Tell me and I forget. Teach me and I remember. Involve me and I learn. The best and most beautiful things in the world cannot be seen or even touched.",
    "Your time is limited so do not waste it living someone else's life. Do not be trapped by dogma which is living with the results of other people's thinking.",
  ],
  long: [
    "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming.",
    "I have a dream that one day this nation will rise up and live out the true meaning of its creed. We hold these truths to be self-evident, that all men are created equal. I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.",
    "You are never too old to set another goal or to dream a new dream. The whole secret of a successful life is to find out what is one's destiny to do, and then do it. The only person you are destined to become is the person you decide to be. Happiness is not something ready made. It comes from your own actions and your own decisions.",
    "Twenty years from now you will be more disappointed by the things that you did not do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover. Life is either a daring adventure or nothing at all.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. The only way to discover the limits of the possible is to go beyond them into the impossible. Education is the most powerful weapon which you can use to change the world. The beautiful thing about learning is that no one can take it away from you.",
  ],
}

export function getQuote(length = 'short') {
  const pool = quotes[length] || quotes.short
  const quote = pool[Math.floor(Math.random() * pool.length)]
  return quote.split(' ')
}
