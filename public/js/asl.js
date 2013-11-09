$(document).on('click',"#asl",asl)
function asl(){
  var sign = 'Aaron'
  sign = sign.toLowerCase();
  console.log(sign);

  for (var i = 0; i < sign.length + 1; i++)
  {
    console.log('hi')
    //document.getElementById('a').show();
    document.getElementById('a').play();

  }

  //window.location.href = "/asl";
}
