import intializeOpenAIAPI, { propperIntializeOpenAIAPI } from "./GPT-API";
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
        onChange: (evt) => {
          console.log("Input Changed!", evt.target.value);
        },
      },
    },
    {
      id: "button-setting",
      name: "Button test",
      description: "tests the button",
      action: {
        type: "button",
        onClick: (evt) => {
          console.log("Button clicked!");
        },
        content: "Button",
      },
    },
    {
      id: "switch-setting",
      name: "Switch Test",
      description: "Test switch component",
      action: {
        type: "switch",
        onChange: (evt) => {
          console.log("Switch!", evt);
        },
      },
    },
    {
      id: "input-setting",
      name: "Input test",
      action: {
        type: "input",
        placeholder: "placeholder",
        onChange: (evt) => {
          console.log("Input Changed!", evt);
        },
      },
    },
    {
      id: "select-setting",
      name: "Select test",
      action: {
        type: "select",
        items: ["one", "two", "three"],
        onChange: (evt) => {
          console.log("Select Changed!", evt);
        },
      },
    },
  ],
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
    string: "test3",
    children: [{ string: "test 4" }, { string: "test 5" }],
  },
];

async function updateBlock(uid, newString) {
  window.roamAlphaAPI.data.block.update({
    block: {
      uid: uid,
      string: newString,
    },
  });
}

async function createChildren(blockUid, childrenContents) {
  var arrayOfNewChildrenUIDs = [];
  for (let index = 0; index < childrenContents.length; index++) {
    const element = childrenContents[index];
    const newBlockUID = roamAlphaAPI.util.generateUID();
    window.roamAlphaAPI.createBlock({
      location: { "parent-uid": blockUid, order: "last" },
      block: { string: element.string, uid: newBlockUID },
    });
    if (element.children) {
      createChildren(newBlockUID, element.children);
    }
    arrayOfNewChildrenUIDs.push(newBlockUID);
  }
  return arrayOfNewChildrenUIDs;
}

function fillInBlockWithChildren(blockUID, headerString, childrenContents) {
  updateBlock(blockUID, headerString);

  createChildren(blockUID, childrenContents);
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

const standardPromptNoInstructions = "";

function putTogetherPrompt(standardizedPrompt, blockSpecificContent) {
  return standardizedPrompt + blockSpecificContent;
}

function jankyResponseParser(GPTResponseContent) {
  // The way this function works, it it just plain text generated by GPT, and uses string interpolation to coerece the output into the structured JSON that we need to pass into fillInBlockWithChildren.

  // This appears to work, but it might be brittle.
  const separatedGPTResponseContent = GPTResponseContent.split("\n\n");

  const jsonToReturn = [];

  for (let index = 0; index < separatedGPTResponseContent.length; index++) {
    const element = separatedGPTResponseContent[index];
    if (element.includes("\n   -")) {
      const [question, answer] = element.split("\n   *");

      console.log(question, answer);

      jsonToReturn.push({
        string: question.replace("- ", ""),
        children: [{ string: answer }],
      });
    } else {
      jsonToReturn.push({ string: element.replace("- ", "") });
    }
  }

  return jsonToReturn;
}

// This function will take json-as-a-string, and turn it into real json, and then turn that into the json that is propperly formated for fillBlockWithChildren.
function propperResponseParser(GPTResponseContent) {
  const inflatedJSON = JSON.parse(
    GPTResponseContent.choices[0].message.function_call.arguments
  );
  console.log(inflatedJSON);

  const arrayOfKeys = Object.keys(inflatedJSON);
  console.log(arrayOfKeys);
  let formattedForRoamJSON = [];
  console.log(inflatedJSON);
  for (let index = 0; index < arrayOfKeys.length; index += 2) {
    const question = inflatedJSON[arrayOfKeys[index]];
    const answer = inflatedJSON[arrayOfKeys[index + 1]];

    const element = {
      string: question + " #ankify",
      children: [{ string: answer }],
    };

    formattedForRoamJSON.push(element);
  }

  return formattedForRoamJSON;
}

const runJankyVersion = true;

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
        console.log(block["block-uid"]);
        const blockContentToSendToGPT = await pullParentBlocksContent(
          block["block-uid"]
        );
        console.log(blockContentToSendToGPT);
        await updateBlock(
          block["block-uid"],
          "GPT-4's first try at flashcards:"
        );
        const uIDsOfCrateadChildren = await createChildren(block["block-uid"], [
          { string: "Loading flashcards..." },
        ]);
        const uIDofLoadingBlock = uIDsOfCrateadChildren[0];
        console.log(uIDsOfCrateadChildren);

        // This if-else block switches between the janky version and the propper version.

        let GPTResponse;
        let structuredGPTResponse;

        if (runJankyVersion) {
          const completedPrompt = putTogetherPrompt(
            promptForJankyVersion,
            blockContentToSendToGPT
          );
          console.log(completedPrompt);
          GPTResponse = await intializeOpenAIAPI(
            { extensionAPI },
            completedPrompt
          );
          console.log(GPTResponse);
          structuredGPTResponse = jankyResponseParser(
            GPTResponse.choices[0].message.content
          );
        } else {
          const completedPrompt = putTogetherPrompt(
            standardPromptNoInstructions,
            blockContentToSendToGPT
          );
          console.log(completedPrompt);
          GPTResponse = await propperIntializeOpenAIAPI(
            { extensionAPI },
            completedPrompt
          );
          console.log(GPTResponse);
          structuredGPTResponse = propperResponseParser(GPTResponse);
        }

        // const structuredGPTResponse = jankyResponseParser(GPTResponse.choices[0].message.content)

        // remove the "loading" sign
        window.roamAlphaAPI.deleteBlock({ block: { uid: uIDofLoadingBlock } });
        fillInBlockWithChildren(
          block["block-uid"],
          "GPT-4's first try at flashcards: #[[auto-anki]]",
          structuredGPTResponse
        );
      }
    },
    "disable-hotkey": false,
    "default-hotkey": "option-cmd-g",
  });
  console.log("load auto-anki");
}

function onunload() {
  console.log("unload example plugin");
}

export default {
  onload,
  onunload,
};
