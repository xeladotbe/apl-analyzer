# APL Analyzer

APL Analyzer is heavily inspired by caniuse, Modernizr and APL doctor by Frank Börncke.

It is designed to tell you which APL features, functions and variables are supported on your or your users' devices.

## Installation

To install the APL Analyzer in your developer account, follow the steps as described here:

https://developer.amazon.com/en-US/docs/alexa/hosted-skills/alexa-hosted-skills-git-import.html#import

## Authoring Tool

You want to see the APL Analyzer in action without creating a skill first?
Save the following APL document in a JSON file and load it in the authoring tool.

```
{
  "document": {
    "type": "APL",
    "version": "1.3",
    "settings": {},
    "theme": "dark",
    "import": [
      {
        "name": "apl-analyzer",
        "version": "1.0.0",
        "source": "https://www.alexandermartin.dev/apl-analyzer/document.json"
      }
    ],
    "resources": [],
    "styles": {},
    "onMount": [],
    "graphics": {},
    "commands": {},
    "layouts": {},
    "mainTemplate": {
      "parameters": [
        "payload"
      ],
      "items": [
        {
          "type": "Analyzer"
        }
      ]
    }
  },
  "datasources": {},
  "sources": {}
}
```

## Amendments

You can extend or modify the APL Analyzer and generate the APL document yourself. All specifications are located in the folder "apl-analyzer", with the included build script you can generate a new APL document. All APL features are documented in YAML Format for better readability.

## Good to know

The skill by default points to the APL Analyzer document on my server. 
https://www.alexandermartin.dev/apl-analyzer/document.json 

However, you can always host your own APL Analyzer document if you want to.
Look at the index.js in your code editor.