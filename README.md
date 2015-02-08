# Graaff
## Your Static Site - Assembled

**.gitignore**

Thanks for checking out our project! It's not *quite* ready to use yet, so please hit the star button and come back shortly!

## Getting Started

Detailed information about getting started can be found on the Graaff website (coming soon).

To get started quickly:

* Open Terminal (or Command Prompt) and navigate to your usual workspace directory
* Ensure you have [NodeJS](http://nodejs.org/) installed (using v0.10.*)
* Make a directory for your project with `mkdir projectname`
* Change directory in the project with `cd projectname`
* Clone the Git repo with `git clone https://github.com/andismith/graaff .`
* Install our dependencies with `npm install`
* If you don't have Grunt CLI, you'll need to install it with `npm install -g grunt-cli`
* Make a copy of the default content folder to get you started `cp -r _content content`
* Run Grunt with the command `grunt`
* By default, Graaff will be available at [localhost:3000](http://localhost:3000/)

Graaff's files are split in to three main folders, found in the `src` folder:

* `content` - This is where your pages and posts live. Each folder in this directory is a folder on your site. Each file is a page. Files are `index.hbs` files, and can be opened in any code editor.
* `logic` - This is the engine behind Graaff. There's not a lot in here, as we're using [Grunt](http://gruntjs.com/) and [Assemble](http://assemble.io) to do most of the hard work.
* `themes` - This is where you can customise the look and feel of your site. Clone the `default` directory to make a new theme and off you go!

## Roadmap

Possible Graaff enhancements.

* Yeoman generator.
* WYSWIWYG editor.