var table_name = 'documents'

var fs = require('fs')
var url = require('url')

var store = require('./store')
var scraper = require('./scraper')
var indexer = require('./indexer')

var log = require('./logger')


// Load backlog to store

log.load()


// Set up data dump file

iso_date = new Date()
store.data_filename = 'data'+iso_date+'.sql'

sql_insert_query = "INSERT INTO "+table_name+" () VALUES "

try {
  fs.writeFileSync(store.data_filename, sql_insert_query)
}

catch(e) {
  console.log(e)
  process.exit(1)
}


// Write to dump file when scraper queue gets empty
// Restart the process

scraper.on('drain',function(){
  fs.appendFile('message.txt', JSON.stringify(store.documents, null, '\t'), function(err) {
    if (err) throw err
      console.log('Data File: Write Complete')
  })

  console.log(store.backlog.last.doc)
})

indexer.on('drain', function() {
  
})



/** Queue Pages **/

start_indexer()


/** Queue Certificates **/

// Pass uri_list

scraper.queue(['http://www.adene.pt/sce/certificados/SCE0000144093728', 'http://www.adene.pt/sce/certificados/DCR0000001000809'])


/** On Exit **/

process.on('exit', function(code) {

  console.log('\n## EXITING - Code '+code+' ##')

  // Save from store
  log.save()
});


var lib = {

  get_index_uri: function(page_number) {
    return constants.index.uri+'page='+page_number+'&'+constants.index.querystring
  },

  start_indexer: function(page_number, offset) {

    page_list = []

    for(i=page_number; i<offset; i++) {
      page_list.push(get_index_uri(i))
    }

    indexer.queue(page_list)

  }

}

var constants = {
  index: {
    uri: 'http://www.adene.pt/sce/micro/certificados-energeticos?',
    querystring: 'tipo_cert=Todos&tipo_ed=Todos&morada=&concelho=all&distrito=all&freguesia=all&conservatoria=&conservatoria_nr=&artigo=&fracao=&numero=&op=Pesquisar&form_build_id=form-qpN7d8_HPQqSQJGhFxB024FLI8tBZLX_naofWt_Mwlo&form_id=certificados_webservice_form'
  }
}