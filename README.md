# Little Fox Vocabulary to Anki Exporter
###### Last Updated: 3 Feb 2025
## Introduction
This project is a browser extension popup that exports vocabulary lists from Little Fox Chinese
into [Anki](https://apps.ankiweb.net/), a popular SRS. 
## Installation
### Build and Install Manually
#### Prerequisites

- [Node v20.10.x or higher](https://nodejs.org/en/download)

#### Steps
1. Clone the repository or download the zip [here](https://github.com/werer9/little-fox-to-anki/archive/refs/heads/main.zip)

   ```bash
   git clone https://github.com/werer9/little-fox-to-anki.git
   ```
2. After cloning/unzipping open the repository
    ```bash
    cd little-fox-to-anki
    ```
3. Install package dependencies
    ```bash
   npm install
   ```
4. Build the extension
   ```bash
   npm run build
   ```
   The extension is now inside the build folder.
5. Install the extension in your browser [Firefox](#firefox-installation) | [Chrome](#chrome-installation)

#### Firefox Installation
1. Open Firefox
2. Enter ```about:debugging``` into the URL bar
3. Click ```This Firefox```
4. Click ```Load Temporary Add-on```
5. Open the build folder and select any file e.g. ```build/manifest.json```
6. The extension will now be shown in the extensions toolbar
#### Chrome Installation
1. Open Chrome
2. Enter ```chrome://extensions/``` into the URL bar
3. Toggle developer mode to ON in the top right corner
4. Click Load Unpacked in the top left corner
5. Select the build folder created by the NPM ```build``` command 
6. The extension will now be shown in the extensions toolbar

