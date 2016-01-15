// MAIN.JS -- Hivemind
// Allen Guo <allenguo@berkeley.edu>

// var DATA_URL = "test.json";
var DATA_URL = "http://hivemind-data.firebaseapp.com/latest.json";

var RATING_TEXTS = {
  1: "Low",
  2: "Moderate",
  3: "High",
  4: "Unavailable"
};

// load is CPU usage as a percentage
// userCount is the number of users
function toRating(load, userCount) {
  if (load >= 70 || userCount >= 30) {
    var rating = 3; // High
  } else if (load >= 30 || userCount >= 15) {
    var rating = 2; // Moderate
  } else if (load >= 0 || userCount >= 0) {
    var rating = 1; // Low
  } else {
    var rating = 4; // Unavailable
  }
  return '<span class="rating rating-' + rating + '">&#9679; ' + RATING_TEXTS[rating] + '</span>';
}

function toHumanDuration(seconds) {
  return moment.duration(seconds, 'seconds').humanize();
}

function toHumanUserCount(count) {
  if (count == 1) {
    return '1 user';
  }
  return count + ' users';
}

function updateLastUpdated(lastUpdated) {
  var timeString = lastUpdated.format("h:mm A, L");
  var humanReadable = lastUpdated.fromNow();
  $('#updated').html('The data below was gathered <b>' + humanReadable + '</b>.');
  $('#loading').html('Refresh to check for updates.');
}

function update() {
  $.getJSON(DATA_URL, function(data) {
    $('#data-body').html('')

    var lastUpdate = moment.unix(data.time_begin + data.time_elapsed);
    updateLastUpdated(lastUpdate);

    var totalLoad = 0;
    var totalLoadCount = 0;
    // data.data holds the data for the servers
    Object.keys(data.data).forEach(function(server) {
      if (server === '') {
        return;
      }

      var serverData = data.data[server];
      if (Object.keys(serverData).length === 0) {
        var items = [server,
                     toRating(-1, -1),
                     '&mdash;',
                     '&mdash;'];
      } else {
        var userCount = serverData.users.length;
        var load = serverData.load_avgs[1] * 100;
        totalLoad += load;
        totalLoadCount++;
        var loadString = parseFloat(load).toFixed(2) + '%';
        if (userCount > 8) {
          var userList = serverData.users.slice(0, 8).join(', ') + ', and ' + (userCount - 8) + ' more';
          var userCountHtml = '<span class="dashed hint--bottom" data-hint="' + userList + '">' + toHumanUserCount(userCount) + '</span>';
        } else if (userCount > 0) {
          var userCountHtml = '<span class="dashed hint--bottom" data-hint="' + serverData.users.join(', ') + '">' + toHumanUserCount(userCount) + '</span>';
        } else {
          var userCountHtml = toHumanUserCount(userCount);
        }
        var items = [server,
                     toRating(load, userCount),
                     userCountHtml,
                     loadString];
      }
      var html = '<tr><td>' + items.join('</td><td>') + '</td></tr>';
      $('#data-body').append(html);
    });

    $('table').tablesorter({sortList: [[1,0], [3,0]], headers: {0: { sorter: 'servers'},
                                                                1: { sorter: 'ratings'},
                                                                2: { sorter: 'users'  },
                                                                3: { sorter: 'loads'  }}});
    $('table').removeClass('hidden');
    updateQuickStatsBox(totalLoad / totalLoadCount);
  }).fail(function() {
    $('#loading')
      .html('Couldn\'t retrieve Hivemind data file. Try again later?')
      .css('color', '#D32F2F');
  });
}

function updateQuickStatsBox(avgLoad) {
  var bestServer = $('table td').html() + '.cs.berkeley.edu';
  activateClipboard(bestServer, '#best');
  $('#best').html(bestServer);

  $('#stats').removeClass('hidden');
}

function activateClipboard(copyText, sel) {
  var clipboard = new Clipboard(sel);
  $(sel)
    .attr('data-clipboard-text', copyText)
    .addClass('dashed hint--bottom')
    .attr('data-hint', 'Click to copy');

  clipboard.on('success', function(e) {
    $(sel).attr('data-hint', 'Copied!');
    setTimeout(function() {
      $(sel).attr('data-hint', 'Click to copy');
    }, 1000); // 1 second
  });
  clipboard.on('error', function(e) {
    $(sel).attr('data-hint', 'Failed (browser unsupported)');
  });
}

function configParsers() {
  $.tablesorter.addParser({ 
    id: 'servers', 
    is: function(s) { 
      return false; 
    },
    format: function(s) { 
      if (s.match(/.*?[a-z]\d$/i)) { // Only one digit at end, e.g. hive1
        return s.slice(0, -1) + '0' + s.slice(-1);
      }
      return s;
    },
    type: 'text'
  });
  $.tablesorter.addParser({ 
    id: 'ratings', 
    is: function(s) { 
      return false; 
    },
    format: function(s) {
      var ratingString = s.split(' ')[1];
      for (var ratingNum in RATING_TEXTS) {
        if (RATING_TEXTS[ratingNum] === ratingString) {
          return ratingNum;
        }
      }
      return 0;
    },
    type: 'numeric'
  });  
  $.tablesorter.addParser({ 
    id: 'users', 
    is: function(s) { 
      return false; 
    },
    format: function(s) { 
      var m = s.match(/(\d+) Users?/i);
      if (m) {
        return parseInt(m[1]);
      }
      return 1000;
    },
    type: 'numeric'
  });  
  $.tablesorter.addParser({ 
    id: 'loads', 
    is: function(s) { 
      return false; 
    },
    format: function(s) { 
      if (s.indexOf('—') !== -1) {
        return 1000;
      }
      return parseFloat(s);
    },
    type: 'numeric'
  });
}

function main() {
  configParsers();
  update();
}

$(main);
