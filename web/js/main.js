// MAIN.JS -- Hivemind
// Allen Guo <allenguo@berkeley.edu>

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
  $.getJSON('data/latest.json', function(data) {
    console.log(data);

    var lastUpdate = moment.unix(data.time_begin + data.time_elapsed);
    updateLastUpdated(lastUpdate);

    // data.data holds the data for the servers  
    Object.keys(data.data).forEach(function(server) {
      if (server === '') {
        return;
      }

      var serverData = data.data[server];
      console.log(serverData)
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
                     '<span class="hint--right" data-hint="' + toHumanDuration(serverData.uptime) + '">' + serverData.uptime + ' s</span>'];
      }
      var html = '<tr><td>' + items.join('</td><td>') + '</td></tr>';
      $('#data-body').append(html);
    });

    $('table').tablesorter({sortList: [[1,0]], headers: {0: { sorter:'servers'}}});
  });
}

function addServerNameParser() {
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
}

function main() {
  addServerNameParser();
  update();
}

$(main);
