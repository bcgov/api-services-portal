const corsButtonForInvalidHeader = document.getElementById('corsButtonForInvalidHeader');
const corsButton = document.getElementById('corsButton');
const corsResponse = document.getElementById('corsResponse');

corsButton.addEventListener('click', () => {
  fetch('http://kong.localtest.me:8000/', {
    method: 'GET',
    headers: {
      'Host' : 'a-service-for-newplatform.api.gov.bc.ca'
    }
  })
    .then(function(response) {
      // Get the response status code
      var responseCode = response.status;
      // Display the response code on the web page
      document.getElementById('corsResponse').innerText = 'Response Code: ' + responseCode;
    })
    .catch(error => {
      console.error(error);
      document.getElementById('corsResponse').innerText = 'Error: ' + error.message;
    });
});

corsButtonForInvalidHeader.addEventListener('click', () => {
  fetch('http://kong.localtest.me:8000/', {
    method: 'GET',
    headers: {
      'Host' : 'a-service-for-newplatform.api.gov.bc.ca',
      'X-PINGOTHER' : 'pingpong'
    }
  })
    .then(function(response) {
      // Get the response status code
      var responseCode = response.status;
      // Display the response code on the web page
      document.getElementById('corsResponseInvalidRequest').innerText = 'Response Code: ' + responseCode;
    })
    .catch(error => {
      console.error(error);
      document.getElementById('corsResponseInvalidRequest').innerText = 'Error: ' + error.message;
    });
});