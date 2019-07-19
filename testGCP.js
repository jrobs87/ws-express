'use strict';

require("dotenv").config();

async function main(
  projectId = 'exploratory-proj-1563483626141'
) {
  // [START translate_quickstart]
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate');

  // Instantiates a client
  const translate = new Translate({projectId});

  // The text to translate
  const text = process.argv.slice(3);

  // The target language
  const target = process.argv[2];

//   console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  // Translates some text into Russian
  const [translation] = await translate.translate(text, target);
  console.log(`Text: ${text}`);
  console.log(`Translation: ${translation}`);
}
// [END translate_quickstart]

const args = process.argv.slice(2);
main(...args).catch(console.error);