// Build the Word Values Object, weighting each keyword by the sum of prices for all
// tweets containing the word.
var words = ['game', 'news', 'money', 'fun', 'good', 'actor', 'movies', 'tech',
  'music', 'people', 'apple', 'google']
var wordValues = {'game': 0, 'news': 0, 'money': 0, 'fun': 0, 'good': 0, 'actor': 0,
  'movies': 0, 'tech': 0, 'music': 0, 'people': 0, 'apple': 0, 'google': 0}

$.ajax({url: 'https://big-data-hci-hackathon.firebaseapp.com/history.json'})
 .done(function(items){

    console.log('number of items loaded:', items.length)
    console.log('first item:', items[0])

    _.forEach(items, function(i) {
      var tweetWords = _.intersection(_.words(i.tweet), words)
      _.forEach(tweetWords, function(w) {
        wordValues[w] = wordValues[w] + i.price/1000
      })
    })

    console.log('wordValues', wordValues)
 })
 .fail(function(err){
     console.error(err)
 })

// Base the trade decision on the total value of all keywords in the tweet.
function decideWhetherOrNotToTrade(t){
  var tweetWords = _.intersection(_.words(t.tweet), words)
    var value = 0
    _.forEach(tweetWords, function(w) {
      var value = value + wordValues[w]
    })

  return bank.currency == 'USD' && value < 20
}
