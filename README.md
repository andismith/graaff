# Graaff
## Your Static Site - Assembled

**.gitignore**

Thanks for checking out our project! It's not *quite* ready to use yet, so please hit the star button and come back shortly!

## Getting Started

Detailed information about getting started can be found on the Graaff website (coming soon).

To get started quickly:

* Open Terminal and navigate to your usual workspace.
* `mkdir projectname`
* `cd projectname`
* `git clone https://github.com/andismith/graaff .` to clone in to current directory
* `npm install`
* If you don't have Grunt CLI, `npm install -g grunt-cli`
* `cp -r _content content`
* `grunt`

Graaff's files are split in to three main folders:

* `content` - This is where your pages and posts live. Each folder in this directory is a folder on your site. Each file is a page. Files are `index.hbs` files, and can be opened in any code editor.
* `logic` - This is the engine behind Graaff. There's not a lot in here, as we're using [Grunt](http://gruntjs.com/) and [Assemble](http://assemble.io) to do most of the hard work.
* `themes` - This is where you can customise the look and feel of your site. Clone the `default` directory to make a new theme and off you go!

Graaff will eventually have it's own Yeoman generator.