function toHumanDuration(seconds) {
  return moment.duration(seconds, 'seconds').humanize();
}

function updateLastUpdated(lastUpdated) {
  var timeString = lastUpdated.format("h:mm A, L");
  var humanReadable = lastUpdated.fromNow();
  $('#updated').html('The data below was gathered at <b>' + timeString + '</b> (' + humanReadable + ').');
}

function update() {
  $.getJSON('data/test_data.json', function(data) {
    console.log(data);

    var lastUpdate = moment.unix(data.time_begin + data.time_elapsed);
    updateLastUpdated(lastUpdate);

    // data.data holds the data for the servers  
    Object.keys(data.data).forEach(function(server) {
      var serverData = data.data[server];
      var items = [server,
                   '<span class="hint--bottom" data-hint="' + serverData.users.join(', ') + '">' + serverData.users.length + ' users</span>',
                   serverData.load_avgs[1],
                   serverData.load_avgs[2],
                   '<span class="hint--right" data-hint="' + toHumanDuration(serverData.uptime) + '">' + serverData.uptime + ' s</span>'];
      var html = '<tr><td>' + items.join('</td><td>') + '</td></tr>';
      $('#data-body').append(html);
    });

    $('table').tablesorter({sortList: [[0,0], [1,0]]});
  });
}

function main() {
  update();
}

$(main);
