var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
const { data } = require('cheerio/lib/api/attributes');


//Provide inputs here for crawling
var START_URL = 'http://www.apple.com';
var SEARCH_WORD = 'computer';


var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + '//' + url.hostname;
let totalPagesCrawled = 0;

 
const readTheUrl = (urlToRead) => {
    return new Promise((resolve, reject) => {
        request(urlToRead, (error, response, body) => {
            if (response.statusCode !== 200) {
                reject({ error: 'Error while reading the url' });
            }
            var $ = cheerio.load(body);
            resolve($);
        });
    });
};



const removeStripedTags = data => data.trim().replace(/(\r\n|\n|\r)/gm, "").replace(/(\r\t|\t|\r)/gm, "")

let pagesMatched  = 0;
let printData = [];
const searchTheWord = () => {
    var nextPage = pagesToVisit.pop();
 
    readTheUrl(nextPage)
    .then(($) => {
        totalPagesCrawled ++;
        var bodyText = $('html > body').text().toLowerCase();
        let index = bodyText.indexOf(SEARCH_WORD.toLowerCase());
        if(index > -1){
            let sentence = removeStripedTags(bodyText.substring(index - 20, index + 20));
             if(bodyText[index - 1] !== '<' && bodyText[index + SEARCH_WORD.length] === ' ' && bodyText[index - 1] === ' '){
                printData.push( `$ ${nextPage}  => '${sentence}'`)
                pagesMatched ++;
            } 
         }
        if(pagesToVisit.length > 0){
            searchTheWord();
        }else {
           console.log(`Crawled ${totalPagesCrawled} pages. Found ${pagesMatched} pages with the term ‘${SEARCH_WORD}’ \n`)
           printData.forEach(obj =>{
               console.log(obj)
           })
        }
    });
}



const searchTheWebsite = (link) => {
    console.log(`visiting the page ${START_URL}`)
    readTheUrl(link)
        .then(($) => {
            var relativeLinks = $("a[href^='/']");
            console.log( 'Found ' + relativeLinks.length + ' relative links on this page \n\n');
            relativeLinks.each(function () {
                pagesToVisit.push(baseUrl + $(this).attr('href'));
            });
            console.log(`Searching the term ‘${SEARCH_WORD}’`)
            searchTheWord();
        })
        .catch((error) => {
            console.log(error, 'error');
        });
};

searchTheWebsite(START_URL);