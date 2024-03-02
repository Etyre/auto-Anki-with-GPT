const promptForJankyVersion = `I’m making flashcards to review material that I’m reading. I’m going to give you a selection of text. Please read this selection, extract the important ideas and interesting facts, and make flash cards for each.

All of the flashcards should be formatted as bullets, with the answer in a nested bullet below the question. Every question should have the tag “#ankify” at the end.

Here are some example flashcards:

* What percentage of American women were working in offices in 1900? #ankify
   * About 20%

* How was it regarded if a woman was working in an office in 1900? #ankify
   * It was lamented as an unfortunate result of financial stress, and slightly shameful to her father.

* Why was it lamentable for a woman to be working in an office in 1900? #ankify
   * Because this would subject them to temptations of being seduced.


Some rules for formulating questions:

1) Questions should be phrased to be open ended, instead of "yes or no" questions.

Instead of a question like... 

* Was the public enthusiastic about the war during World War II? #ankify
    * No, the public was not very gung ho or enthusiastic about it.

...produce a question like...

* What was the attitude of the American public towards World War II? #ankify
    * Determined to do what needs to be done, but without enthusiasm or patriotic fervor. 

Instead of...

* Were wages frozen during WWII? #ankify
    * Yes.

...write...

* What happen to wages during WWII? #ankify
    * Wages were frozen.


2) Each flash card should have as few words as possible, while still capturing all of the important details about a fact or idea. Most questions, and most answers should have fewer than 10 words. 

Condense the sentences as much as possible while still getting the core idea across. It's better to break an idea into multiple, shorter, questions, so long as each question is complete and comprehensible on it's own.



Make between 1 and 7 flashcards in total—as many as is necessary to capture all the important or interesting ideas and facts in the text.

Here is the text to make flashcards for:

`





export default promptForJankyVersion


const extaBitAboutClozes = `Alternatively, cards can be a single bullet point with a “cloze”. A “cloze” card is a sentence with one or more blanks, for the user to fill in themselves, to complete the sentence. The cloze should be the most important part of the sentence, for the user to guess. The format is to write the full sentence, and then enclose the answer (the part of the text that will be represented as a blank) in curly brackets. Each cloze should start with the number “1”, and a colon. There can be multiple clozes in a sentence. The bullet point should still have the “#ankify” tag.

Some examples of cloze cards:

* The Holy Alliance was composed of {1:Russia}, {1:Prussia}, and {1:Austria}. #ankify 

* The quadruple alliance was composed of {1:Austria}, {1:Prussia}, {1: Russia}, and {1:Great Britain}. #ankify 

* The congress system worked pretty well for {1:avoiding Great Power war}, for about {1:100 years}. #ankify

* The nation of Belgium was created at {1:the Congress of Vienna}. #ankify

* In WWI, the British promised the Arabs {1:Independence} in return for {1:rebelling against the Turks}. #ankify

* In 1900, a girl who set out to earn money was {1:embarrassing her father} by implying {1:that he couldn't support her}. #ankify

* In 1900, women would never be present in a {1:bar} or {1:smoking train-car}. #ankify

* In an American city in 1900, {1:horses} were everywhere. #ankify

* In 1900, people went without {fresh fruit and vegetables} for most of the year. #ankify

The cloze should be selected so that there's a unique corect answer (instead of several ways to fill in then blank that would still be correct), and open ended enough that the answer isn't obvious from the rest fo the sentence.`