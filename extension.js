var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e)},e={};t.d(e,{Z:()=>c});const n={tabTitle:"Test Ext 1",settings:[{id:"button-setting",name:"Button test",description:"tests the button",action:{type:"button",onClick:t=>{console.log("Button clicked!")},content:"Button"}},{id:"switch-setting",name:"Switch Test",description:"Test switch component",action:{type:"switch",onChange:t=>{console.log("Switch!",t)}}},{id:"input-setting",name:"Input test",action:{type:"input",placeholder:"placeholder",onChange:t=>{console.log("Input Changed!",t)}}},{id:"select-setting",name:"Select test",action:{type:"select",items:["one","two","three"],onChange:t=>{console.log("Select Changed!",t)}}}]},o=[{string:"test 1"},{string:"test 2"},{string:"test3",children:[{string:"test 4"},{string:"test 5"}]}];async function l(t,e){for(let n=0;n<e.length;n++){const o=e[n],i=roamAlphaAPI.util.generateUID();window.roamAlphaAPI.createBlock({location:{"parent-uid":t,order:"last"},block:{string:o.string,uid:i}}),o.children&&l(i,o.children)}}function i(t,e,n){!async function(t,e){window.roamAlphaAPI.data.block.update({block:{uid:t,string:e}})}(t,e),l(t,n)}const c={onload:async function({extensionAPI:t}){t.settings.panel.create(n),t.ui.commandPalette.addCommand({label:"create cards",callback:()=>{let t=window.roamAlphaAPI.ui.getFocusedBlock();null!=t&&(console.log(t["block-uid"]),i(t["block-uid"],"Pretend GPT output:",o))},"disable-hotkey":!1,"default-hotkey":"option-cmd-g"}),console.log("load example plugin")},onunload:function(){console.log("unload example plugin")}};var a=e.Z;export{a as default};