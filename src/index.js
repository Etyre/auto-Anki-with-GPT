const panelConfig = {
  tabTitle: "Test Ext 1",
  settings: [
      {id:          "button-setting",
       name:        "Button test",
       description: "tests the button",
       action:      {type:    "button",
                     onClick: (evt) => { console.log("Button clicked!"); },
                     content: "Button"}},
      {id:          "switch-setting",
       name:        "Switch Test",
       description: "Test switch component",
       action:      {type:     "switch",
                     onChange: (evt) => { console.log("Switch!", evt); }}},
      {id:     "input-setting",
       name:   "Input test",
       action: {type:        "input",
                placeholder: "placeholder",
                onChange:    (evt) => { console.log("Input Changed!", evt); }}},
      {id:     "select-setting",
       name:   "Select test",
       action: {type:     "select",
                items:    ["one", "two", "three"],
                onChange: (evt) => { console.log("Select Changed!", evt); }}}
  ]
};

async function onload({extensionAPI}) {
  // set defaults if they dont' exist
  if (!extensionAPI.settings.get('data')) {
      await extensionAPI.settings.set('data', "01");
  }
  extensionAPI.settings.panel.create(panelConfig);

  console.log("load example plugin");
}

function onunload() {
  console.log("unload example plugin");
}

export default {
onload,
onunload
};


// Eli's wishlist

// 1. Function that writes some children
// 2. Function that grabs the data in the parent block.
// 3. Hot key.
// 4. GPT API



// Function that updates a bloc string and adds some children, with helper functions.

const exampleJSON = [
    {string: "test 1"},
    {string: "test 2"}, 
    {string : "test3", children : 
    [{string: "test 4"}, {string: "test 5"}]
  }
]

async function updateBlock (uid, newString) {
  window.roamAlphaAPI.data.block.update({"block" : 
                                          {"uid": uid, 
                                          "string": newString}})
}

async function createChildren (blockUid, childrenContents) {
  for (let index = 0; index < childrenContents.length; index++) {
    const element = childrenContents[index];
    const newBlockUID = roamAlphaAPI.util.generateUID();  
    window.roamAlphaAPI.createBlock(
        {"location": 
          {"parent-uid": blockUid, "order": "last"}, 
        "block": 
          {"string": element.string, "uid": newBlockUID}
        },  
        )
      if (element.children) {
        createChildren(newBlockUID, element.children)
      }
      }
}

function fillInBlockWithChildren (blockUID, headerString, childrenContents) {
  updateBlock(blockUID, headerString)

  createChildren(blockUID, childrenContents)
}


// Hotkey that calls fillInBlockWithChildren

