var Crawler = require('crawler')
var store = require('./store')
var fs = require('fs')

var scraper = new Crawler({
  maxConnections: 10,

  callback: function(err, res, done){

    if(err)
      console.log(err)

    else {

      var $ = res.$

        // Registry Object
        var ident_string = $('.perito-item-ident').text().trim()
        var ident = registry_data(ident_string)

        // Energy Class
        var img_str = $('#cert-image').attr("src").trim()
        var img_name = img_str.substring(img_str.lastIndexOf("/")+1, img_str.length)
        var energy_class = img_name.split('.')[0]

        // Verify dates
        var issue_date = $(".perito-item-data-emissao *")[0].next.data.trim()
        if(issue_date.length < 10)
          issue_date = "NULL"

        var expiry_date = $(".perito-item-data-emissao *")[0].next.data.trim()
        if(expiry_date.length < 10)
          expiry_date = "NULL"


        // Compile final data
        var doc = {
          doc_number: $('#doc_certificado strong').text(),
          type: $(".perito-item:nth-of-type(3)").clone().children().remove().end().text().trim(),
          info: $('#texto_certificado > span').text().trim(),
          energy_class: energy_class,
          address: $(".perito-item:nth-of-type(4)").clone().children().remove().end().text().trim(),
          location: $(".perito-item-localidade *")[0].next.data.trim(),
          town: $(".perito-item-freguesia *")[0].next.data.trim(),
          country: $(".perito-item-concelho *")[0].next.data.trim(),
          issue_date: $(".perito-item-data-emissao *")[0].next.data.trim(),
          expiry_date: $(".perito-item-validade *")[0].next.data.trim(),
          expert_name: $(".perito-item-nome *")[0].next.data.trim(),
          expert_number: $(".perito-item-cod *")[0].next.data.trim(),
          reg_name: ident.name,
          reg_number: ident.number
        }

        // Add to the SQL insert statement
        var sql_valstring = '('
        for(var key in doc) {
          sql_valstring += "'"+doc[key]+"',"
        }
        sql_valstring = sql_valstring.slice(0, -1)
        sql_valstring += '),'

        try {
          fs.appendFileSync('./'+store.data_filename, sql_valstring)
        }

        catch(err) {
          console.log(err)
          return 0
        }

        // Save doc to dump
        store.documents.push(doc)

        // Mark last saved doc
        store.backlog.last.doc = doc.doc_number

        // Mark first doc
        if(!store.flag_first_read) {
          store.flag_first_read = true
          store.backlog.first.doc = doc.doc_number
        }

        done()

      }
    }
  })

/** Strip out info from registry information string **/

function registry_data(string) {

  string = string.replace(/\s\s+/g, ' ')

  var reg_name_rx = /Imóvel descrito na Conservatória do (.*?) sob o nº/gi
  var reg_no_rx = /sob o nº (.*)/gi

  try {
    var reg_name = reg_name_rx.exec(string)[1]
    var reg_no = reg_no_rx.exec(string)[1]
  }

  catch(e) {
    var reg_name = '-'
    var reg_no = '-'
  }

  return {
    name: reg_name,
    number: reg_no
  }

}

exports = module.exports = scraper