var request = require('request');

var mlRequest = request.defaults({
  'auth': {
      'user': 'admin',
      'pass': 'admin',
      'sendImmediately': false
    }
});

console.log('******** NON-REPEATABLE READ TEST ********');

mlRequest({
    'uri': 'http://localhost:8000/v1/documents?uri=/foo.txt',
    'method': 'PUT',
    'body': '0'
  },
  function (error, response, body) {
    var result = (response.statusCode === 201 || response.statusCode === 204) ? 'success' : 'failure';
    console.log('1.  Wrote /foo.txt: ' + result + ' (' + response.statusCode + ')');
    mlRequest({
      'uri': 'http://localhost:8000/v1/transactions?name=tx1',
      'method': 'POST'
    },
    function (error, response, body) {
      var tx1 = response.headers.location.substring(17);
      console.log('2.  T1 created: ' + tx1);
      mlRequest({
        'uri': 'http://localhost:8000/v1/transactions?name=tx2',
        'method': 'POST'
      },
      function (error, response, body) {
        var tx2 = response.headers.location.substring(17);
        console.log('3.  T2 created: ' + tx2);
        console.log('4.  T1 starting to read /foo.txt');
        mlRequest({
          'uri': 'http://localhost:8000/v1/documents?uri=/foo.txt&txid=' + tx1,
          'method': 'GET'
        },
        function (error, response, body) {
          console.log('5.  T1 finished reading /foo.txt, value: ' + body);
          // 5. tx2 write /foo.txt
          console.log('6.  T2 starting to write /foo.txt, value: 2');
          mlRequest({
            'uri': 'http://localhost:8000/v1/documents?uri=/foo.txt&txid=' + tx2,
            'method': 'PUT',
            'body': '2'
          },
          function (error, response, body) {
            var result = response.statusCode === 204 ? 'success' : 'failure';
            console.log('7.  T2 finished writing /foo.txt: ' + result + ' (' + response.statusCode + ')');
            console.log('8.  T2 starting to commit');
            mlRequest({
              'uri': 'http://localhost:8000/v1/transactions/' + tx2 + '?result=commit',
              'method': 'POST'
            },
            function (error, response, body) {
              var result = response.statusCode === 204 ? 'success' : 'failure';
              console.log('9.  T2 finished commit: ' + result + ' (' + response.statusCode + ')');
              mlRequest({
                'uri': 'http://localhost:8000/v1/documents?uri=/foo.txt',
                'method': 'GET'
              },
              function (error, response, body) {
                console.log('10. Read /foo.txt, value: ' + body);
              });
              mlRequest({
                'uri': 'http://localhost:8000/v1/documents?uri=/foo.txt',
                'method': 'DELETE'
              },
              function (error, response, body) {
                console.log('11. Deleted /foo.txt');
              });

            });
          });

          // Pause to ensure write request has been sent
          setTimeout(function(){
            console.log('12. T1 starting to read /foo.txt');
            mlRequest({
              'uri': 'http://localhost:8000/v1/documents?uri=/foo.txt&txid=' + tx1,
              'method': 'GET'
            },
            function (error, response, body) {
              console.log('13. T1 finished reading /foo.txt, value: ' + body);
              console.log('14. T1 starting to commit');
              mlRequest({
                'uri': 'http://localhost:8000/v1/transactions/' + tx1 + '?result=commit',
                'method': 'POST'
              },
              function (error, response, body) {
                var result = response.statusCode === 204 ? 'success' : 'failure';
                console.log('15. T1 finished commit: ' + result + ' (' + response.statusCode + ')');
              });
            });
          },
          2000
        );

        });
      });
    });
  }
);
