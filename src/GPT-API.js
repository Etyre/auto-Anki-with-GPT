import OpenAI from 'openai';


async function intializeOpenAIAPI({extensionAPI}, completedPrompt) {
    const openai = new OpenAI({
        apiKey: extensionAPI.settings.get("openai-api-key"), 
        dangerouslyAllowBrowser: true,
  });
    console.log(openai)
    const params = {
    messages: [{ role: 'user', content: completedPrompt }],
    model: 'gpt-3.5-turbo',
  };
  const chatCompletion = await openai.chat.completions.create(params);
  console.log(chatCompletion)
  return chatCompletion
}



export default intializeOpenAIAPI