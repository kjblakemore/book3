function analyze(){

  //
  // Getting To Know the Data
  //

  heading('Examples')

  ask('how many measurements were included in this dataset?', example1)

  ask('how many samples does each measurement contain?', example2)

  ask('at the 10-th measurement, what are valid sample values (> 0)?', example3)
  
  heading('Measurements and Samples')

  ask('how many unique non-zero, non-negative sample values in this dataset? what are they?', func1)

  ask('what is the average time (seconds) between two measurements?', func2)

  ask('at 09:57:18, how many samples in this measurement have the value 7?', func3)

  ask('which measurement has the most number of samples with the value 3?', func4)

  ask('how many measurements have no sample value greater than zero?', func5)

  ask('which valid (i.e., greater than zero) sample value is the most common?', func6)

  heading('Mapping')

  ask('when was the boat furthest away from NYC (40.7127 N, 74.0059 W)? what was the distance?', func7)
  // use Leaflet to draw a line between NYC and this "furtherest away" location

  ask('what was the path of the boat?', func8)
  // use Leaflet to draw a line between every two locations

  ask('where were the most common sample value measured?', func9)
  // say, your answer to Question Six is 13, draw a marker for each measurement that has
  // at least one sample whose value is 13

  ask('how does the density of valid sample values change across the geographical area?', func10)
  // use the brightness to indicate high number of valid sample values each
  // for each measurement, draw a marker,
  // use the brightness to represent the number of valid samples
  // the brighter a spot, the higher the number
  // for those measurements without a valid sample, draw nothing

  heading('Science')

  ask('what is the distribution of fish?', func11)

  ask('what is the distribution of  are schools of zooplankton?', func12)


  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  })
  toggleSourecode()
}

//How many measurements were included in the dataset?
function example1(){
  return items.length
}

// How many samples does each measurement contain?
function example2(){
  return items[0].Samples.length
}

// At the 10-th measurement, wht are valid sample values (>0)?
function example3(){
  return _.filter(items[9].Samples, function(d){
    return d > 0
  }).join(', ')
}

// How many unique non-zero, non-negative sample values in this dataset? what are they?
function func1(){
  var sampleValues = _.chain(items)
    .map('Samples')
    .flatten()
    .uniq()
    .filter(function(s) { return s > 0 })
    .map(_.round)                      // remove trailing zeros
    .value()

  return sampleValues.length + ' unique positive samples: ' + sampleValues.join(', ')
}

// What is the average time in seconds between two adjacent measurements.
function func2(){
  // First map items to time difference between current and previous measurments
  // Assumes same date for all entries.
  var deltas = _.map(items, function(item, i) {
    if (i == 0) return 0
    else {
      var str = items[i-1].Ping_time.split(':')
      var t0 = parseInt(str[0]) * 3600+ parseInt(str[1]) * 60 + parseInt(str[2])

      str = items[i].Ping_time.split(':')
      var t1 = parseInt(str[0]) * 3600+ parseInt(str[1]) * 60 + parseInt(str[2])

      return t1 - t0
    }
  })

  // Return average of the time differences
  return _.round(_.sum(deltas)/deltas.length) + ' seconds'
}

// At 09:57:18, how many samples in this measurement have the value 7?
function func3(){
  return _.chain(items)
    .find({'Ping_time': '09:57:18'})
    .filter(function(s) { return s == 7 })
    .value().length
}

// Which measurement has the most number of samples with the value 3?
// Measurements are numbered sequentially, starting at 1
function func4(){
  // First get sorted list of indices and corresponding counts of samples values = 3.
  var counts = _.chain(items)
    .map(function(d) { 
      var count = _.filter(d.Samples, function(s) { return s == 3 }).length
      return { 'Ping_index': d.Ping_index, 'Count': count }
    })
    .sortBy('Count')
    .value()

  // Maximum number of 3s.
  var max = _.max(counts, function(d) { return d.Count })

  // Return indices of max 3s.
  return _.chain(counts)
    .filter(function(d) { return d.Count == max.Count })
    .pluck('Ping_index')
    .value().join(', ')
}

// How many measurements have no postive sample values?
function func5(){
  return _.filter(items, function(d) { return _.max(d.Samples) <= 0}).length
}

// Which valid (i.e., greater than 0) sample value is the most common?
function func6(){
  return _.chain(items)
    .map('Samples')
    .flatten()
    .filter(function(d) { return d > 0 })
    .groupBy()
    .mapValues('length')
    .pairs()
    .max(function(d) { return d[1] })
    .value()[0]
}

// When was the boat furthest away from NYC (40.7127 N, 74.0059 W)? what was the distance?
function func7(){
  var coordNYC = {latitude: 40.7127, longitude: -74.0059}

  var max = _.chain(items)
    .map(function(d) {
      var coord = {latitude: d.Latitude, longitude: d.Longitude}
      return [geolib.getDistance(coordNYC, coord), d.Latitude, d.Longitude]
    }).max(function(d) { return d[0] })
    .value()

  var boat = [parseFloat(max[1]), parseFloat(max[2])]
  var el = $(this).find('.viz')[0]    // lookup the element that will hold the map
  $(el).height(500)                   // set the map to the desired height
  var map = createMap(el, boat, 6)

  var marker = L.marker(boat).addTo(map)
  marker.bindPopup('Boat Location').openPopup()

  var latlngs = [[40.7127, -74.0059], boat]
  L.polyline(latlngs, {color: 'black'}).addTo(map)

  return 'Distance was ' + max[0]/1000 + ' km'
}

// What was the path of the boat?
function func8(){
  // Center for maps.
  var center = geolib.getCenter([
      {latitude: items[0].Latitude, longitude: items[0].Longitude},
      {latitude: items[items.length-1].Latitude, longitude: items[items.length-1].Longitude}
    ])

  var pos = [center.latitude, center.longitude]
  var el = $(this).find('.viz')[0]   
  $(el).height(500)                
  var map = createMap(el, pos, 12)

  _.forEach(items, function(d, index) {
    var latlng1 = [parseFloat(d.Latitude), parseFloat(d.Longitude)]

    if (index == 0) {
      var marker = L.marker(latlng1).addTo(map)
      marker.bindPopup('Starting Point').openPopup()
    } else {
      var latlng0 = [parseFloat(items[index-1].Latitude), parseFloat(items[index-1].Longitude)]
      var latlngs = [latlng0, latlng1]
      var polyline = L.polyline(latlngs, {color: 'black'}).addTo(map)
    }
  })

  return 'Boat traveled south along path shown below.'
}

// At what locations was the most common sample value measured?
function func9(){
  var center = geolib.getCenter([
      {latitude: items[0].Latitude, longitude: items[0].Longitude},
      {latitude: items[items.length-1].Latitude, longitude: items[items.length-1].Longitude}
    ])

  var pos = [center.latitude, center.longitude]
  var el = $(this).find('.viz')[0]   
  $(el).height(500)                
  var map = createMap(el, pos, 12)

  var mostCommon = _.chain(items)
    .map('Samples')
    .flatten()
    .filter(function(d) { return d > 0 })
    .groupBy()
    .mapValues('length')
    .pairs()
    .max(function(d) { return d[1] })
    .value()[0]

  _.forEach(items, function(d, index) {
    if (_.includes(d.Samples, mostCommon)) {
      var latlng = [parseFloat(d.Latitude), parseFloat(d.Longitude)]
      L.circle(latlng, 50, {color: 'red', fillColor: '#f03', fillOpacity: 0.5}).addTo(map)
    }
  })

  return 'The locations of the most common sample values are shown in red, below.'
}

// How does the density of valid sample values change across the geographical area?
function func10(){
  var center = geolib.getCenter([
      {latitude: items[0].Latitude, longitude: items[0].Longitude},
      {latitude: items[items.length-1].Latitude, longitude: items[items.length-1].Longitude}
    ])

  var pos = [center.latitude, center.longitude]
  var el = $(this).find('.viz')[0]   
  $(el).height(500)                
  var map = createMap(el, pos, 12)

  var counts = _.map(items, function(d) {
    var count = _.filter(d.Samples, function(s) { return s > 0 }).length
    return [d.Latitude, d.Longitude, count]
  })

  var colors = ['#c6e1f1', '#a1cee9', '#7bbbe0', '#55a7d7', '#3c8ebd', '#2e6e93', '#285e7e', 
    '#214f69', '#1a3f54', '#142f3f']

  _.forEach(counts, function(c){
    if(c[2] != 0) {
      var latlng = [parseFloat(c[0]), parseFloat(c[1])]
      var color = colors[parseInt(c[2]/10)]
      L.circle(latlng, 5, { color: color, fillOpacity: 1 }).addTo(map);
    }
  })

  return 'Darker shades represent higher densities'
}

// What is the distribution of fish?
function func11(){

  // Create an L x D matrix, where L is latitude and D is depth.  
  // Where fish are found, the corresponding entry is the depth, otherwise it is null.
  // Measurements are taken every two meters of depth.
  var fish = _.map(items, function(d) {
    return _.map(d.Samples, function(s, index) {
      var value = _.round(parseFloat(s))
      return _.includes([3, 32, 39, 52, 1, 45, 40, 10, 11, 4, 37, 53, 8, 33, 30], value) ? index * 2 : null
    })
  })

  // Transpose the matrix to L x D.
  var fishT = _.zip.apply(_, fish)

  // Remove depths where no fish were found.  Chartist can not handle series elements of all nulls.
  var fishTFiltered = _.filter(fishT, function(d) { return _.sum(d) != 0 })

  // X-axis is the Latitude
  var latitudes = []
  var latStart = parseFloat(items[0].Latitude)
  var latEnd = parseFloat(items[items.length-1].Latitude)
  var step = (latEnd - latStart)/400
  for (i = 0; i < 400; i++) latitudes[i] = (latStart + i * step)

  // Then, plot locations where fish were found as (latitude, depth).
  var el = $(this).find('.viz')[0]
  $(el).height(500)   

  var options = {
    showLine: false,
    axisX: { labelInterpolationFnc: function(value, index) {
      return index % 50 === 0 ? value : null
      }
    }
  }              

  var data = {
    labels: latitudes,
    series: fishTFiltered
  }

  new Chartist.Line(el, data, options)

  return 'The chart below shows the distribution of fish in relation to the latitude (x-axis) and depth (y-axis), in meters'
}

// What is the distribution of zooplankton?
function func12(){
  // Create an L x D matrix, where L is latitude and D is depth.  
  // Where plankton are found, the corresponding entry is the depth, otherwise it is null.
  // Measurments are done every 2 meters of depth.
  var plankton = _.map(items, function(d) {
    return _.map(d.Samples, function(s, index) {
      var value = _.round(parseFloat(s))
      return _.includes([39, 52, 45, 42, 7, 13, 49, 40, 10, 11, 36, 37, 53, 8, 20], value) ? index * 2 : null
    })
  })

  // Transpose the matrix to L x D.
  var planktonT = _.zip.apply(_, plankton)

  // Remove depths where no plankton were found.  Chartist can not handle series elements of all nulls.
  var planktonTFiltered = _.filter(planktonT, function(d) { return _.sum(d) != 0 })

  // X-axis is the Latitude
  var latitudes = []
  var latStart = parseFloat(items[0].Latitude)
  var latEnd = parseFloat(items[items.length-1].Latitude)
  var step = (latEnd - latStart)/400
  for (i = 0; i < 400; i++) latitudes[i] = (latStart + i * step)

  // Then, plot locations where plankton were found as (latitude, depth).
  var el = $(this).find('.viz')[0]
  $(el).height(500)   

  var options = {
    showLine: false,
    axisX: { labelInterpolationFnc: function(value, index) {
      return index % 50 === 0 ? value : null;
      }
    },
    axisY: { type: Chartist.AutoScaleAxis, high: 600 }
  }              

  var data = {
    labels: latitudes,
    series: planktonTFiltered
  }

  new Chartist.Line(el, data, options)

  return 'The chart below shows the distribution of plankton in relation to the latitude (x-axis) and depth (y-axis), in meters'
}
