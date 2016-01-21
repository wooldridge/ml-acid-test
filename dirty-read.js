var request = require('request');

// Set common options
var mlRequest = request.defaults({
  'auth': {
      'user': 'admin',
      'pass': 'admin',
      'sendImmediately': false
    }
});

var urlBase = 'http://localhost:8000/v1/';

console.log('******** DIRTY READ TEST ********');
mlRequest.post({
  'uri': urlBase + 'transactions?name=tx1'
},
function (error, resp, body) {
  var tx1 = resp.headers.location.substring(17);
  console.log('1.  T1 created: ' + tx1);
  mlRequest.post({
    'uri': urlBase + 'transactions?name=tx2'
  },
  function (error, resp, body) {
    var tx2 = resp.headers.location.substring(17);
    console.log('2.  T2 created: ' + tx2);
    console.log('3.  T1 starting to write /foo.txt');
    mlRequest.put({
      'uri': urlBase + 'documents?uri=/foo.txt&txid=' + tx1,
      'body': 'bar'
    },
    function (error, resp, body) {
      var result = resp.statusCode === 201 ? 'success' : 'failure';
      console.log('4.  T1 finished writing /foo.txt: ' + result + ' (' + resp.statusCode + ')');
      console.log('5.  T2 starting to read /foo.txt');
      mlRequest.get({
        'uri': urlBase + 'documents?uri=/foo.txt&txid=' + tx2
      },
      function (error, resp, body) {
        var result = resp.statusCode === 200 ? 'success' : 'failure';
        console.log('6.  T2 finished reading /foo.txt: ' + result + ' (' + resp.statusCode + ')');
        console.log('7.  T2 starting commit');
        mlRequest.post({
          'uri': urlBase + 'transactions/' + tx2 + '?result=commit'
        },
        function (error, resp, body) {
          var result = resp.statusCode === 204 ? 'success' : 'failure';
          console.log('8.  T2 finished commit: ' + result + ' (' + resp.statusCode + ')');
        });
      });
      // Pause to ensure read request has been sent
      setTimeout(function(){
          var action = 'rollback';
          console.log('9.  T1 starting rollback');
          mlRequest.post({
            'uri': urlBase + 'transactions/' + tx1 + '?result=' + action
          },
          function (error, resp, body) {
            var result = resp.statusCode === 204 ? 'success' : 'failure';
            console.log('10. T1 finished rollback: ' + result + ' (' + resp.statusCode + ')');
          });
        },
        2000
      );
    });
  });
});
