import intializeOpenAIAPI from "./GPT-API";







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
// 4.    GPT API

// Function that updates a bloc string and adds some children, with helper functions.

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
  }
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

const standardPrompt = "Please sumarize the following text: "

function putTogetherPrompt(standardizedPrompt, blockSpecificContent) {
    return standardizedPrompt + blockSpecificContent
}






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
      let block = window.roamAlphaAPI.ui.getFocusedBlock();
      if (block != null) {
        console.log(block['block-uid']);
        const blockContentToSendToGPT = await pullParentBlocksContent(block['block-uid'])
        console.log(blockContentToSendToGPT)
        const completedPrompt = putTogetherPrompt(standardPrompt, blockContentToSendToGPT)
        console.log(completedPrompt)
        intializeOpenAIAPI({extensionAPI},completedPrompt)

        // fillInBlockWithChildren(block['block-uid'], "Pretend GPT output:", exampleJSON)
        
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




