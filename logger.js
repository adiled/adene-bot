var fs = require('fs')
var store = require('./store')

var log = module.exports = {

  filename: 'backlog.json',

  struct: {
    first: {
      doc: null,
      page: null
    },  
    last: {
      doc: null,
      page: null
    }
  },

  create: function() {

    fs.open(this.filename, 'wx', function(err, fd) {
      if (err) {
        if (err.code === "EEXIST") {
          console.log('[Logger] Log file already exists');
          return;
        } else throw err
      }

      else {
        fs.writeFile(fd, JSON.stringify(log.struct), function(err) {
          if(err)
            console.log('[Log File] Write Failed')
        })
      }
      
    })

  },

  save: function() {

    try {
      fs.writeFileSync('./'+this.filename, JSON.stringify(store.backlog))
    } catch(e) {
      console.log('[Log File] Dump failed')
    }

  },

  load: function() {

    try {
      data = fs.readFileSync('./'+this.filename);
      store.backlog = JSON.parse(data.toString())
    }

    catch(err) {
      throw err
    }

  }
}


log.create()