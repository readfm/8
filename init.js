if('serviceWorker' in navigator && 1){
  navigator.serviceWorker.register('sw.js',{
	scope: './'
  })
    .then((registration) => {
      console.log('-> Registered the service worker successfuly')
      
    })
    .catch((err) => {
      console.log('-> Failed to register:', err)
    });
}