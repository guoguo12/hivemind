// MAIN.JS -- Hivemind
// Allen Guo <allenguo@berkeley.edu>

var DATA_URL = "https://hivemind-data.firebaseapp.com/latest.json";

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
  $('#updated').html('The data below was gathered at <b>' + timeString + '</b> (' + humanReadable + ').');
}

function update() {
  $.getJSON(DATA_URL, function(data) {
    $('#data-body').html('')

    var lastUpdate = moment.unix(data.time_begin + data.time_elapsed);
    updateLastUpdated(lastUpdate);

    // data.data holds the data for the servers  
    Object.keys(data.data).forEach(function(server) {
      if (server === '') {
        return;
      }

      var serverData = data.data[server];
      if (Object.keys(serverData).length === 0) {
        var items = [server,
                     '&mdash;',
                     '&mdash;',
                     '&mdash;',
                     '&mdash;'];
      } else {
        var items = [server,
                     '<span class="hint--bottom" data-hint="' + serverData.users.join(', ') + '">' + toHumanUserCount(serverData.users.length) + '</span>',
                     serverData.load_avgs[1],
                     serverData.load_avgs[2],
                     toHumanDuration(serverData.uptime)];
      }
      var html = '<tr><td>' + items.join('</td><td>') + '</td></tr>';
      $('#data-body').append(html);
    });

    $('table').tablesorter({sortList: [[1,0]], headers: {0: { sorter: 'servers'},
                                                         1: { sorter: 'users'  },
                                                         2: { sorter: 'loads'  },
                                                         3: { sorter: 'loads'  },
                                                         4: { sorter: 'uptimes'}}});
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
  $.tablesorter.addParser({ 
    id: 'uptimes', 
    is: function(s) { 
      return false; 
    },
    format: function(s) {
      if (s.indexOf('—') !== -1) {
        return Infinity;
      }
      var chunks = s.split(' ');
      return moment.duration(parseInt(chunks[0] === 'a' ? 1 : chunks[0]), chunks[1]).asMilliseconds();
    },
    type: 'numeric'
  });   
}

function main() {
  configParsers();
  update();
//  setTimeout(function() { location.reload(); }, 1000 * 60); // Refresh every minute
}

$(main);
