var request = require('request');

var mlRequest = request.defaults({
  'auth': {
      'user': 'admin',
      'pass': 'admin',
      'sendImmediately': false
    }
});

console.log('******** DIRTY READ TEST ********');

mlRequest.post({
    'uri': 'http://localhost:8000/v1/transactions?name=tx1'
  },
  function (error, response, body) {
    var tx1 = response.headers.location.substring(17);
    console.log('1.  T1 created: ' + tx1);
    // 2. Create second transaction (tx2)
    mlRequest.post({
      'uri': 'http://localhost:8000/v1/transactions?name=tx2'
    },
    function (error, response, body) {
      var tx2 = response.headers.location.substring(17);
      console.log('2.  T2 created: ' + tx2);
      // 3. tx1 write /foo.txt
      console.log('3.  T1 starting to write /foo.txt');
      mlRequest.put({
        'uri': 'http://localhost:8000/v1/documents?uri=/foo.txt&txid=' + tx1,
        'body': 'bar'
      },
      function (error, response, body) {
        var result = response.statusCode === 201 ? 'success' : 'failure';
        console.log('4.  T1 finished writing /foo.txt: ' + result + ' (' + response.statusCode + ')');
        console.log('5.  T2 starting to read /foo.txt');
        mlRequest.get({
          'uri': 'http://localhost:8000/v1/documents?uri=/foo.txt&txid=' + tx2
        },
        function (error, response, body) {
          var result = response.statusCode === 200 ? 'success' : 'failure';
          console.log('6.  T2 finished reading /foo.txt: ' + result + ' (' + response.statusCode + ')');
          console.log('7.  T2 starting commit');
          mlRequest.post({
            'uri': 'http://localhost:8000/v1/transactions/' + tx2 + '?result=commit'
          },
          function (error, response, body) {
            var result = response.statusCode === 204 ? 'success' : 'failure';
            console.log('8.  T2 finished commit: ' + result + ' (' + response.statusCode + ')');
          });
        });
        // Pause to ensure read request has been sent
        setTimeout(function(){
            var action = 'rollback';
            console.log('9.  T1 starting rollback');
            mlRequest.post({
              'uri': 'http://localhost:8000/v1/transactions/' + tx1 + '?result=' + action
            },
            function (error, response, body) {
              var result = response.statusCode === 204 ? 'success' : 'failure';
              console.log('10. T1 finished rollback: ' + result + ' (' + response.statusCode + ')');
            });
          },
          2000
        );
      });
    });
  }
);
