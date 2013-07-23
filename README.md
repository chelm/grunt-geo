# grunt-geo

> Find and map the geographic center of a github repo

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-geo --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-geo');
```

## The "geo" task

### Overview
In your project's Gruntfile, add a section named `geo` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  geo: {
    collaborators: {
      options: {
        // file: 'name of the file you want (defaults to collaborators.geojson)'
        // repo: 'the https url to a github api of a repo, uses package.json to default to current project'
        // token: 'your github api token for issuing requests beyond the anon rate limits'
      },
    },
  },
})
```

### Options

#### options.file
Type: `String`
Default value: `'collaborators.geojson'`

A string value that is used as the name of the file you'd like to create

#### options.repo
Type: `String`
Default value: `'https://api.github.com/repos/{user}/{repo}'`

A string value used to create geojson from any other github repo

#### options.token
Type: `String`
Default value: `none`

A string value used to make more requests than the anon github rate limits let you 

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
