/** INDEXER **/
var store = require('./store')

var Crawler = require('crawler')

var indexer = new Crawler({
  maxConnections: 1,

  callback: function(err, res, done) {

    var $ = res.$

    store.doc_uri_list

    done()

  }

})

exports = module.exports = indexer