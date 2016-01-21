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

console.log('******** PHANTOM READ TEST ********');
mlRequest.put({
  'uri': urlBase + 'documents?uri=/foo.txt&collection=bar',
  'body': '0'
},
function (error, resp, body) {
  var result = (resp.statusCode === 201 || resp.statusCode === 204) ? 'success' : 'failure';
  console.log('1.  Wrote to collection "bar": ' + result + ' (' + resp.statusCode + ')');
  mlRequest.post({
    'uri': urlBase + 'transactions?name=tx1'
  },
  function (error, resp, body) {
    var tx1 = resp.headers.location.substring(17);
    console.log('2.  T1 created: ' + tx1);
    mlRequest.post({
      'uri': urlBase + 'transactions?name=tx2'
    },
    function (error, resp, body) {
      var tx2 = resp.headers.location.substring(17);
      console.log('3.  T2 created: ' + tx2);
      console.log('4.  T1 starting to read collection "bar"');
      mlRequest.get({
        'uri': urlBase + 'search?collection=bar&format=json'
      },
      function (error, resp, body) {
        var parsed = JSON.parse(body);
        console.log('5.  T1 finished reading collection "bar", total: ' + parsed.total);
        console.log('6.  T2 starting to write to collection "bar"');
        mlRequest.put({
          'uri': urlBase + 'documents?uri=/foo2.txt&collection=bar',
          'body': '2'
        },
        function (error, resp, body) {
          var result = resp.statusCode === 204 ? 'success' : 'failure';
          console.log('7.  T2 finished writing to collection "bar"');
          console.log('8.  T1 starting to read collection "bar"');
          mlRequest.get({
            'uri': urlBase + 'search?collection=bar&format=json'
          },
          function (error, resp, body) {
            var parsed = JSON.parse(body);
            console.log('9.  T1 finished reading collection "bar", total: ' + parsed.total);
            console.log('10. T1 starting to commit');
            mlRequest.post({
              'uri': urlBase + 'transactions/' + tx1 + '?result=commit'
            },
            function (error, resp, body) {
              var result = resp.statusCode === 204 ? 'success' : 'failure';
              console.log('11. T1 finished commit: ' + result + ' (' + resp.statusCode + ')');
              console.log('12. T2 starting to commit');
              mlRequest.post({
                'uri': urlBase + 'transactions/' + tx2 + '?result=commit'
              },
              function (error, resp, body) {
                var result = resp.statusCode === 204 ? 'success' : 'failure';
                console.log('13. T2 finished commit: ' + result + ' (' + resp.statusCode + ')');
                mlRequest.del({
                  'uri': urlBase + 'search?collection=bar'
                },
                function (error, resp, body) {
                  var result = resp.statusCode === 204 ? 'success' : 'failure';
                  console.log('14. Deleted collection "bar": ' + result + ' (' + resp.statusCode + ')');
                });
              });
            });
          });
        });
      });
    });
  });
});
