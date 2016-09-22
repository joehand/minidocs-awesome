var fs = require('fs')
var ndjson = require('ndjson')
var pump = require('pump')
var through = require('through2')

var toc = {
  'Welcome': {'Awesome Dat': 'awesome-dat.md'}
}
var repoList = ['clkao/awesome-dat']

pump(process.stdin, ndjson.parse(), through.obj(function (data, enc, next) {
  var matches = data.readme.split(/\n#{2,}(.*)\n/)
  if (!matches) return next()
  matches.forEach(function (item, i) {
    if (i % 2) {
      if (i === matches.length) return
      var tocRepos = {}
      var repos = matches[i+1].match(/github.com\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)/g)
      if (!repos) return

      repos = Array.from(new Set(repos))
      repos.forEach(function (repo, i) {
        repos[i] = repo.replace('github.com/', '')
        tocRepos[repos[i]] = repos[i] + '.md'
      })
      repoList = repoList.concat(repos)
      toc[item.trim()] = tocRepos
    }
  })
  next()
}), function (err) {
  if (err) throw err
  fs.writeFileSync('docs/contents.json', JSON.stringify(toc))
  fs.writeFileSync('repos.txt', repoList.join('\n'))
})
