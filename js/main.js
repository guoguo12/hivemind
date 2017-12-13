var DATA_URL = 'https://labs.aguo.us/hivemind/data/latest.json';

var OFFLINE = false;

var RATING_TEXTS = ['Low', 'Moderate', 'High', 'Unavailable'];

var USERS_SHOWN = 8;

var DEFAULT_SORTING = 'rating';

var CLIPBOARD_COPY_TEXT = 'Copied!';
var CLIPBOARD_ERROR_TEXT = 'Failed (browser unsupported)';

// See RATING_TEXTS above for explanations of rating values
var toRating = function(usage, userCount) {
  if (usage >= 0.7 || userCount >= 30) {
    return 2;
  } else if (usage >= 0.3 || userCount >= 15) {
    return 1;
  } else {
    return 0;
  }
};

var update = function() {
  $.getJSON(DATA_URL, function(data) {
    console.log('Generation time: ' + data.time_elapsed + 's');

    // Transform JSON data into array of server objects
    var servers = [];
    Object.keys(data.data).forEach(function(name) {
      if (name === '') {
        return;
      }

      var server = {};
      server.name = name;
      server.shortName = name.split('.')[0];
      if (server.shortName.match(/\D*\d$/i)) {  // Ends with single digit
        // Add a zero in the tens place to make sorting human-friendly
        server.sortName = server.shortName.slice(0, -1) + '0' + server.shortName.slice(-1);
      } else {
        server.sortName = server.shortName;
      }

      var jsonData = data.data[name];
      if ($.isEmptyObject(jsonData)) {
        // Many of these properties are used for sorting
        server.available = false;
        server.usage = Infinity;
        server.users = [];
        server.userCount = -1;
        server.rating = 3;
      } else {
        server.available = true;
        server.usage = jsonData.load_avgs[1];
        server.users = jsonData.users;
        server.userCount = server.users.length;
        server.rating = toRating(server.usage, server.userCount);
      }

      servers.push(server);
    });
    app.servers = servers;

    app.lastUpdate = data.time_begin + data.time_elapsed;
    app.dataLoaded = true;
  }).fail(function() {
    app.failed = true;
  });
};

var app = new Vue({
  el: '#main',
  data: {
    dataLoaded: false,
    failed: false,
    offline: OFFLINE,

    lastUpdate: '',
    servers: [],

    search: '',
    orderBy: DEFAULT_SORTING,
    reverse: false
  },
  filters: {
    formatTime: function(time) {
      return moment.unix(time).format('h:mm a, MMMM Do, YYYY');
    },
    timeSince: function(time) {
      return moment.unix(time).fromNow();
    },
    percent: function(value) {
      return parseFloat(value * 100).toFixed(2);
    },
    ratingText: function(rating) {
      return RATING_TEXTS[rating];
    },
    userCount: function(count) {
      return count === 1 ? ' 1 user' : count + ' users';
    },
    userList: function(users) {
      var count = users.length;
      if (count > USERS_SHOWN) {
        return users.slice(0, USERS_SHOWN).join(', ') + ', and ' + (count - USERS_SHOWN) + ' more';
      }
      return users.join(', ');
    }
  },
  computed: {
    orderedServers: function() {
      var key = this.orderBy;
      return this.servers.sort(function(a, b) {
        if (a[key] > b[key]) {
          return 1;
        } else if (a[key] < b[key]) {
          return -1;
        } else {
          return 0;
        }
      });
    },
    reversedServers: function() {
      return this.reverse ? this.orderedServers.reverse() : this.orderedServers;
    },
    filteredServers: function() {
      var search = this.search;
      if (search === '') {
        return this.reversedServers;
      }
      return this.reversedServers.filter(function(server) {
        return server.shortName.match(search);
      });
    }
  },
  methods: {
    headerClass: function(columnName) {
      return {
        headerSortDown: this.orderBy === columnName && !this.reverse,
        headerSortUp: this.orderBy === columnName && this.reverse
      };
    },
    headerClick: function(columnName) {
      if (this.orderBy === columnName) {
        this.reverse = !this.reverse;
      } else {
        this.orderBy = columnName;
      }
    }
  },
  watch: {
    filteredServers: activateAllClipboards
  }
});

function activateAllClipboards() {
  // TODO: Get the timing to work without setTimeout
  setTimeout(function() {
    $('tr td:first-child span').each(function(i, elem) {
      activateClipboard(elem);
    });
  }, 100);
}

function activateClipboard(sel) {
  var clipboard = new Clipboard(sel);
  clipboard.on('success', function(e) {
    var origAttr = $(sel).attr('data-hint');
    $(sel).attr('data-hint', CLIPBOARD_COPY_TEXT);
    setTimeout(function() {
      $(sel).attr('data-hint', origAttr);
    }, 1000);  // 1 second
  });
  clipboard.on('error', function(e) {
    $(sel).attr('data-hint', CLIPBOARD_ERROR_TEXT);
  });
}

$(update);
