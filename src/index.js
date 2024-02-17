import  intializeOpenAIAPI, { propperIntializeOpenAIAPI }  from "./GPT-API";
import promptForJankyVersion from "./promptText";

// import { intializeOpenAIAPI, propperIntializeOpenAIAPI } from "./GPT-API";


const panelConfig = {
  tabTitle: "Auto-anki generator",
  settings: [
    {
      id: "openai-api-key",
      name: "OpenAI API key",
      description: "For authenticating the OpenAI API",
      action: {
        type: "input",
        placeholder: "Put your OpenAI API key here!",
        onChange: (evt) => { console.log("Input Changed!", evt.target.value); },
      }
    },
    {
      id: "button-setting",
      name: "Button test",
      description: "tests the button",
      action: {
        type: "button",
        onClick: (evt) => { console.log("Button clicked!"); },
        content: "Button"
      }
    },
    {
      id: "switch-setting",
      name: "Switch Test",
      description: "Test switch component",
      action: {
        type: "switch",
        onChange: (evt) => { console.log("Switch!", evt); }
      }
    },
    {
      id: "input-setting",
      name: "Input test",
      action: {
        type: "input",
        placeholder: "placeholder",
        onChange: (evt) => { console.log("Input Changed!", evt); }
      }
    },
    {
      id: "select-setting",
      name: "Select test",
      action: {
        type: "select",
        items: ["one", "two", "three"],
        onChange: (evt) => { console.log("Select Changed!", evt); }
      }
    }
  ]
};

// Eli's wishlist

// 1. ✅ Function that writes some children 
// 2. ✅ Function that grabs the data in the parent block.
// 3. ✅ Hot key
// 4. ✅ GPT API

// We now having a working MVP! WOOO! 🎉

// New Wishlist 

// 0.    Continue tinkering with the prompt. See if I can get it to produce cloze deletions.
// 1. ✅ Make a non-janky parser function, using OpenAI functions
// 3. ✅ Organize the flow here so that the janky and non-janky versions are clearly legible and readable and not interfering with each other.
// 4. ✅ Make the janky version add ankify tags.
// 4. ✅ Make it so that the non-janky flow can generate arbitrary numbers of questions (I think.)
// 5. ✅ Try a different "loading..." sign that, has the loading in the first child of the target block, instead of the target block itself.
// 6.    Set up the propper API flow so that cloze cards and "normal" cards are mixed. (I think this makes sense.) 


// Function that updates a block string and adds some children, with helper functions.

const exampleJSON = [
  { string: "test 1" },
  { string: "test 2" },
  {
    string: "test3", children:
      [{ string: "test 4" }, { string: "test 5" }]
  }
]

async function updateBlock(uid, newString) {
  window.roamAlphaAPI.data.block.update({
    "block":
    {
      "uid": uid,
      "string": newString
    }
  })
}

async function createChildren(blockUid, childrenContents) {
  var arrayOfNewChildrenUIDs = []
  for (let index = 0; index < childrenContents.length; index++) {
    const element = childrenContents[index];
    const newBlockUID = roamAlphaAPI.util.generateUID();
    window.roamAlphaAPI.createBlock(
      {
        "location":
          { "parent-uid": blockUid, "order": "last" },
        "block":
          { "string": element.string, "uid": newBlockUID }
      },
    )
    if (element.children) {
      createChildren(newBlockUID, element.children)
    }
    arrayOfNewChildrenUIDs.push(newBlockUID)
  }
  return arrayOfNewChildrenUIDs
}

function fillInBlockWithChildren(blockUID, headerString, childrenContents) {
  updateBlock(blockUID, headerString)

  createChildren(blockUID, childrenContents)
}

// Function that grabs the contents of the parent of the the block you call the function from.

async function pullParentBlocksContent(uid) {
  let query = `[:find (pull ?e [* {:block/parents ...}])
              ; The syntax of {: block/parents ...} means "pull the parents recursively"
                      :in $ ?namespace
                      :where 
            [?e :block/uid ?namespace]
            ]`;

  let result = window.roamAlphaAPI.q(query, uid).flat()[0].parents;
  // result.sort((a, b) => {
  //     // Check if 'order' property exists in both objects
  //     if ('order' in a && 'order' in b) {
  //         return a.order - b.order; // Sort by 'order'
  //     } else if ('order' in a) {
  //         return -1; // 'a' has 'order', so it comes first
  //     } else if ('order' in b) {
  //         return 1; // 'b' has 'order', so it comes first
  //     } else {
  //         return 0; // Neither has 'order', maintain the current order
  //     }
  // });
  return result.slice(-1)[0].string;
}

// Constructing the prompt that we'll pass into the GPT API.

const standardPromptNoInstructions = ""

// const promptForJankyVersion = `I’m making flashcards to review material that I’m reading. I’m going to give you a selection of text. Please read this selection, extract the important ideas and interesting facts, and make flash cards for one.

// All of the flashcards should be formatted as bullets, with the answer in a nested bullet below the question. Every question should have the tag “#ankify” at the end.

// Here are some example flashcards:

// * What percentage of American women were working in offices in 1900? #ankify
//    * About 20%

// * How was it regarded if a woman was working in an office in 1900? #ankify
//    * It was lamented as an unfortunate result of financial stress, and slightly shameful to her father.

// * Why was it lamentable for a woman to be working in an office in 1900? #ankify
//    * Because this would subject them to temptations of being seduced.


// Questions should be phrased to be open ended instead of "yes or no" questions.

// Instead of a question like... 

// * Was the public enthusiastic about the war during World War II? #ankify
//     * No, the public was not very gung ho or enthusiastic about it.

// ...produce a question like...

// * What was the attitude of the American public towards World War II? #ankify
//     * Determined to do what needs to be done, but without enthusiasm or patriotic fervor. 

// Instead of...

// * Were wages frozen during WWII? #ankify
//     * Yes.

// ...write...

// * What happen to wages during WWII? #ankify
//     * Wages were frozen.


// Alternatively, cards can be a single bullet point with a “cloze”. A “cloze” card is a sentence with one or more blanks, for the user to fill in themselves, to complete the sentence. The cloze should be the most important part of the sentence, for the user to guess. The format is to write the full sentence, and then enclose the answer (the part of the text that will be represented as a blank) in curly brackets. Each cloze should start with the number “1”, and a colon. There can be multiple clozes in a sentence. The bullet point should still have the “#ankify” tag.

// Some examples of cloze cards:

// * The Holy Alliance was composed of {1:Russia}, {1:Prussia}, and {1:Austria}. #ankify 

// * The quadruple alliance was composed of {1:Austria}, {1:Prussia}, {1: Russia}, and {1:Great Britain}. #ankify 

// * The congress system worked pretty well for {1:avoiding Great Power war}, for about {1:100 years}. #ankify

// * The nation of Belgium was created at {1:the Congress of Vienna}. #ankify

// * In WWI, the British promised the Arabs {1:Independence} in return for {1:rebelling against the Turks}. #ankify

// * In 1900, a girl who set out to earn money was {1:embarrassing her father} by implying {1:that he couldn't support her}. #ankify

// * In 1900, women would never be present in a {1:bar} or {1:smoking train-car}. #ankify

// * In an American city in 1900, {1:horses} were everywhere. #ankify

// * In 1900, people went without {fresh fruit and vegetables} for most of the year. #ankify

// The cloze should be selected so that there's a unique corect answer (instead of several ways to fill in then blank that would still be correct), and open ended enough that the answer isn't obvious from the rest fo the sentence.


// Each flash card should have as few words as possible, while still capturing all of the important details about a fact or idea. Most questions, and most answers should have fewer than 10 words. 

// Condense the sentences as much as possible while still getting the core idea across.

// Make between 1 and 5 flashcards: as many as is necessary to capture all the important or interesting ideas and facts in the text.



// Here is the text to make flashcards for:

// `



function putTogetherPrompt(standardizedPrompt, blockSpecificContent) {
    return standardizedPrompt + blockSpecificContent
}

function jankyResponseParser(GPTResponseContent) {
// The way this function works, it it just plain text generated by GPT, and uses string interpolation to coerece the output into the structured JSON that we need to pass into fillInBlockWithChildren.

// This appears to work, but it might be brittle.
  const separatedGPTResponseContent = GPTResponseContent.split("\n\n")
  
  const jsonToReturn = []

  for (let index = 0; index < separatedGPTResponseContent.length; index++) {
    
    const element = separatedGPTResponseContent[index];
    if (element.includes("\n   *")) {
      const [question, answer] = element.split("\n   *")

      console.log(question, answer)

      jsonToReturn.push({
        string: question.replace("* ", ""), children:
          [{ string: answer }]
      }) 
    }else{
    jsonToReturn.push({ string: element.replace("* ", "") })}
  }
  
  return jsonToReturn
}

// This function will take json-as-a-string, and turn it into real json, and then turn that into the json that is propperly formated for fillBlockWithChildren.
function propperResponseParser(GPTResponseContent){
  const inflatedJSON = JSON.parse(GPTResponseContent.choices[0].message.function_call.arguments)
  console.log(inflatedJSON)

  const arrayOfKeys = Object.keys(inflatedJSON)
  console.log(arrayOfKeys)
  let formattedForRoamJSON = []
  console.log(inflatedJSON)
  for (let index = 0; index < arrayOfKeys.length; index+=2) {
    const question = inflatedJSON[arrayOfKeys[index]]
    const answer = inflatedJSON[arrayOfKeys[index+1]]

    const element = { string: question+' #ankify', children: [{string: answer}] }

    formattedForRoamJSON.push(element)

  }

  return formattedForRoamJSON
}

const runJankyVersion = false

async function onload({ extensionAPI }) {
  // set defaults if they dont' exist
  // if (!extensionAPI.settings.get('data')) {
  //     await extensionAPI.settings.set('data', "01");
  // }

  // Creating a setting panel
  extensionAPI.settings.panel.create(panelConfig);

  // Creating a new command palette command
  extensionAPI.ui.commandPalette.addCommand({
    label: "create cards",
    callback: async () => {
      // If you want to use the propper version, set the prompt to standardPromptNoInstructions, and use propperIntializeOpenAIAPI and propperResponseParser
      // If you want to use the janky version, set the prompt to standardPromptIncludingFormattingIntruction, and use IntializeOpenAIAPI with jankyResponseParser.
      let block = window.roamAlphaAPI.ui.getFocusedBlock();
      if (block != null) {
        console.log(block['block-uid']);
        const blockContentToSendToGPT = await pullParentBlocksContent(block['block-uid'])
        console.log(blockContentToSendToGPT)
        await updateBlock(block['block-uid'], "GPT-3-Turbo's first try at flashcards: #[[auto-anki]]")
        const uIDsOfCrateadChildren = await createChildren(block['block-uid'], [{string: "Loading flashcards..."}])
        const uIDofLoadingBlock = uIDsOfCrateadChildren[0]
        console.log(uIDsOfCrateadChildren)

        // This if-else block switches between the janky version and the propper version.
        
        let GPTResponse
        let structuredGPTResponse
  
        if(runJankyVersion){ 
          const completedPrompt = putTogetherPrompt(promptForJankyVersion, blockContentToSendToGPT)
          console.log(completedPrompt)
          GPTResponse = await intializeOpenAIAPI({extensionAPI}, completedPrompt)
          console.log(GPTResponse)
          structuredGPTResponse = jankyResponseParser(GPTResponse.choices[0].message.content)
        }else{
          const completedPrompt = putTogetherPrompt(standardPromptNoInstructions, blockContentToSendToGPT)
          console.log(completedPrompt)
          GPTResponse = await propperIntializeOpenAIAPI({extensionAPI}, completedPrompt)
          console.log(GPTResponse)
          structuredGPTResponse = propperResponseParser(GPTResponse)
        }
        
        // const structuredGPTResponse = jankyResponseParser(GPTResponse.choices[0].message.content)

        // remove the "loading" sign
        window.roamAlphaAPI.deleteBlock({"block": {"uid": uIDofLoadingBlock}})
        fillInBlockWithChildren(block['block-uid'], "GPT-3-Turbo's first try at flashcards:", structuredGPTResponse)
      }
    },
    "disable-hotkey": false,
    "default-hotkey": "option-cmd-g"
  })
  console.log("load auto-anki");


}

function onunload() {
  console.log("unload example plugin");
}

export default {
  onload,
  onunload
};




