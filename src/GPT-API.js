import OpenAI from 'openai';

// There are two versions of this function. One is simpler for using with my janky parser, and one is slighly more complicated, and requires only a minimal parser.

// This is the function that works with my janky parser.
async function intializeOpenAIAPI({ extensionAPI }, completedPrompt) {
  const openai = new OpenAI({
    apiKey: extensionAPI.settings.get("openai-api-key"),
    dangerouslyAllowBrowser: true,
  });
  console.log(openai)
  const params = {
    messages: [{ role: 'user', content: completedPrompt }],
    model: 'gpt-4',
  };
  const chatCompletion = await openai.chat.completions.create(params);
  console.log(chatCompletion)
  return chatCompletion
}

// This is the propper one.

// The JSON formats we want it to use.
const anki_questions_custom_functions = [
  {
    'name': 'synthasize_anki_questions',
    'description': 'Synthasize a series of useful AP test style question and answer from the body of the input text',
    'parameters': {
      'type': 'object',
      'properties': {
        'q_1': {
          'type': 'string',
          'description': 'Initial Question'
        },
        'q_1_a_1': {
          'type': 'string',
          'description': 'a correct answer'
        },
        'q_2': {
          'type': 'string',
          'description': 'a second Question'
        },
        'q_2_a_1': {
          'type': 'string',
          'description': 'a correct answer to the second question'
        },
        'q_3': {
          'type': 'string',
          'description': 'a third Question'
        },
        'q_3_a_1': {
          'type': 'string',
          'description': 'a correct answer to the third Question'
        },
        'q_4': {
          'type': 'string',
          'description': 'Initial Question'
        },
        'q_4_a_1': {
          'type': 'string',
          'description': 'a correct answer'
        },
        'q_5': {
          'type': 'string',
          'description': 'a second Question'
        },
        'q_5_a_1': {
          'type': 'string',
          'description': 'a correct answer to the second question'
        },
        'q_6': {
          'type': 'string',
          'description': 'a third Question'
        },
        'q_6_a_1': {
          'type': 'string',
          'description': 'a correct answer to the third Question'
        },
        'q_7': {
          'type': 'string',
          'description': 'Initial Question'
        },
        'q_7_a_1': {
          'type': 'string',
          'description': 'a correct answer'
        },
        'q_8': {
          'type': 'string',
          'description': 'a second Question'
        },
        'q_8_a_1': {
          'type': 'string',
          'description': 'a correct answer to the second question'
        },
        'q_9': {
          'type': 'string',
          'description': 'a third Question'
        },
        'q_9_a_1': {
          'type': 'string',
          'description': 'a correct answer to the third Question'
        },
        'q_10': {
          'type': 'string',
          'description': 'a third Question'
        },
        'q_10_a_1': {
          'type': 'string',
          'description': 'a correct answer to the third Question'
        },
      }
    }
  }
]

const anki_cloze_custom_functions = [
  {
    'name': 'anki_cloze_custom',
    'description': 'extract a key sentence from this paragraph. Something an AP test would find important. Create an anki style cloze {deletion} from that sentence where the small important part of the sentence is within single curly brackets.',
    'parameters': {
      'type': 'object',
      'properties': {
        'key_sentence_1': {
          'type': 'string',
          'description': 'the key sentence from the paragraph'
        },
        'cloze_1': {
          'type': 'string',
          'description': 'the anki style {cloze deletion} based on key sentence 1'
        }

      }
    }
  }
]

//The function itself:
export async function propperIntializeOpenAIAPI({ extensionAPI }, completedPrompt) {
  const openai = new OpenAI({
    apiKey: extensionAPI.settings.get("openai-api-key"),
    dangerouslyAllowBrowser: true,
  });
  console.log(openai)
  const params = {
    messages: [{ role: 'user', content: completedPrompt }],
    model: 'gpt-4',
    functions: anki_questions_custom_functions,
    function_call: 'auto',
    // n: 20,
  };
  const chatCompletion = await openai.chat.completions.create(params);
  console.log(chatCompletion)
  return chatCompletion
}

export default intializeOpenAIAPI 
