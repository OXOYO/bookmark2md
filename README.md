# bookmark2md

    Convert chrome bookmarks to md files and push them to GitHub repository.

English | [简体中文](./README_CN.md)

## Use script
```bash
  // step 1
  cd Script
  // step 2
  export chrome bookmarks to `/Script/bookmarks.html`
  // step 3
  node bookmark2md.js
```


## Chrome Extension

### Install

Chrome webstore：[Bookmark2md](https://chrome.google.com/webstore/detail/bookmark2md/gbclgdopkgkofbmioamakhnlogeajmll)

### Use

Step 1:After installation, click the Bookmark2md extension on your browser to log in, or log in with the extended option.

![sign in](docs/img/img_001_640x400.png)

Step 2:
    1. Select a repository you want to push to;
    2. Select a branch;
    3. Enter the bookmark directory to be excluded, please separate them with commas;
    4. Enter the maximum level, which is used to control the directory with the deepest layers relative to the bookmark root node to generate a separate md file;
    5. Enter the submission message.

Step 3:Click the push button to submit.

***Note: There may be cases where the submission fails, and it is recommended to submit it repeatedly.***

 ![transfer and push](docs/img/img_002_640x400.png)
